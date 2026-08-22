import { PrismaClient, CategoryType } from '@prisma/client';
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

const defaultCategories = [
  { name: 'Salary', type: CategoryType.INCOME, icon: 'payments' },
  { name: 'Freelance', type: CategoryType.INCOME, icon: 'work' },
  { name: 'Business', type: CategoryType.INCOME, icon: 'store' },
  { name: 'Food & Groceries', type: CategoryType.EXPENSE, icon: 'restaurant' },
  { name: 'Rent & Utilities', type: CategoryType.EXPENSE, icon: 'home' },
  { name: 'Transport', type: CategoryType.EXPENSE, icon: 'directions_car' },
  { name: 'Shopping', type: CategoryType.EXPENSE, icon: 'shopping_cart' },
  { name: 'Entertainment', type: CategoryType.EXPENSE, icon: 'movie' },
];

async function main() {
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  console.log('Default categories seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });