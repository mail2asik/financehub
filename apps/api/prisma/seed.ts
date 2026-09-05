import {
  PrismaClient,
  Role,
  AccountType,
  CategoryType,
  TransactionType,
  RecurrenceFrequency,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in reverse order of foreign key dependencies
  await prisma.goalContribution.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Seed Test Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@financehub.local',
      passwordHash,
      firstName: 'Demo',
      lastName: 'User',
      role: Role.USER,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@financehub.local',
      passwordHash,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
    },
  });

  console.log(`👤 Seeded Users: ${demoUser.email} (USER), ${adminUser.email} (ADMIN)`);

  // 3. Seed Default System & User Categories
  const systemCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Salary',
        type: CategoryType.INCOME,
        icon: 'cash',
        userId: null, // System default
      },
    }),
    prisma.category.create({
      data: {
        name: 'Housing & Rent',
        type: CategoryType.EXPENSE,
        icon: 'home',
        userId: null,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Groceries',
        type: CategoryType.EXPENSE,
        icon: 'shopping-cart',
        userId: null,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Utilities',
        type: CategoryType.EXPENSE,
        icon: 'zap',
        userId: null,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Freelance & Investments',
        type: CategoryType.INCOME,
        icon: 'trending-up',
        userId: demoUser.id, // User specific
      },
    }),
  ]);

  console.log(`🏷️ Created ${systemCategories.length} categories.`);

  const [salaryCat, housingCat, groceriesCat, utilitiesCat, freelanceCat] = systemCategories;

  // 4. Seed User Accounts
  const bankAccount = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'HDFC Checking Bank',
      type: AccountType.BANK,
      balance: 150000.00,
      currency: 'INR',
    },
  });

  const savingsAccount = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'ICICI Savings',
      type: AccountType.BANK,
      balance: 500000.00,
      currency: 'INR',
    },
  });

  const creditCard = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Amazon Pay Credit Card',
      type: AccountType.CREDIT_CARD,
      balance: -12500.00,
      currency: 'INR',
    },
  });

  console.log('🏦 Seeded user accounts.');

  // 5. Seed Historical & Monthly Transactions
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.transaction.createMany({
    data: [
      {
        userId: demoUser.id,
        accountId: bankAccount.id,
        categoryId: salaryCat.id,
        type: TransactionType.INCOME,
        amount: 250000.00,
        description: 'Monthly Corporate Salary',
        notes: 'Credited directly to bank account',
        transactionDate: firstDayOfMonth,
      },
      {
        userId: demoUser.id,
        accountId: bankAccount.id,
        categoryId: housingCat.id,
        type: TransactionType.EXPENSE,
        amount: 35000.00,
        description: 'Apartment Rent Payment',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 2),
      },
      {
        userId: demoUser.id,
        accountId: creditCard.id,
        categoryId: groceriesCat.id,
        type: TransactionType.EXPENSE,
        amount: 8500.00,
        description: 'Weekly Grocery Purchase',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 4),
      },
      {
        userId: demoUser.id,
        accountId: bankAccount.id,
        toAccountId: savingsAccount.id,
        categoryId: null,
        type: TransactionType.TRANSFER,
        amount: 50000.00,
        description: 'Monthly Savings Allocation Transfer',
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 5),
      },
    ],
  });

  console.log('💳 Seeded income, expense, and transfer transactions.');

  // 6. Seed Monthly Budget & Allocated Categories
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budget = await prisma.budget.create({
    data: {
      userId: demoUser.id,
      month: currentMonth,
      year: currentYear,
      categories: {
        create: [
          { categoryId: housingCat.id, allocated: 40000.00 },
          { categoryId: groceriesCat.id, allocated: 20000.00 },
          { categoryId: utilitiesCat.id, allocated: 10000.00 },
        ],
      },
    },
  });

  console.log(`📊 Seeded monthly budget for ${currentMonth}/${currentYear}.`);

  // 7. Seed Recurring Transactions (for BullMQ Scheduler)
  await prisma.recurringTransaction.create({
    data: {
      userId: demoUser.id,
      accountId: bankAccount.id,
      categoryId: utilitiesCat.id,
      type: TransactionType.EXPENSE,
      amount: 2999.00,
      description: 'High-Speed Broadband Bill',
      frequency: RecurrenceFrequency.MONTHLY,
      startDate: now,
      nextExecutionDate: now,
      isActive: true,
    },
  });

  console.log('🔄 Seeded scheduled recurring transactions.');

  // 8. Seed Savings Goals & Goal Contributions
  const goal = await prisma.savingsGoal.create({
    data: {
      userId: demoUser.id,
      name: 'Emergency Reserve Fund',
      targetAmount: 300000.00,
      currentAmount: 150000.00,
      targetDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
      isCompleted: false,
    },
  });

  await prisma.goalContribution.create({
    data: {
      goalId: goal.id,
      amount: 150000.00,
      notes: 'Initial transfer from savings account',
    },
  });

  console.log('🎯 Seeded savings goals and goal contributions.');

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });