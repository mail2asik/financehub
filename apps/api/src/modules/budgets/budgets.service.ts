import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/budget.dto';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(userId: string, dto: CreateBudgetDto) {
    const { month, year, categories } = dto;

    // Find existing budget for this month/year or create a new one
    let budget = await this.prisma.budget.findUnique({
      where: { userId_month_year: { userId, month, year } },
    });

    if (!budget) {
      budget = await this.prisma.budget.create({
        data: { userId, month, year },
      });
    }

    // Upsert allocated budget limits for each category
    for (const item of categories) {
      await this.prisma.budgetCategory.upsert({
        where: {
          budgetId_categoryId: {
            budgetId: budget.id,
            categoryId: item.categoryId,
          },
        },
        update: { allocated: new Prisma.Decimal(item.allocated) },
        create: {
          budgetId: budget.id,
          categoryId: item.categoryId,
          allocated: new Prisma.Decimal(item.allocated),
        },
      });
    }

    return this.getBudgetDetails(userId, month, year);
  }

  async getBudgetDetails(userId: string, month: number, year: number) {
    const budget = await this.prisma.budget.findUnique({
      where: { userId_month_year: { userId, month, year } },
      include: {
        categories: {
          include: { category: { select: { id: true, name: true, icon: true } } },
        },
      },
    });

    if (!budget) {
      return { month, year, totalAllocated: 0, totalSpent: 0, categories: [] };
    }

    // Calculate start and end date for the target month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get aggregated expenses grouped by category for this period
    const expenses = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: startDate, lte: endDate },
        categoryId: { in: budget.categories.map((c) => c.categoryId) },
      },
      _sum: { amount: true },
    });

    const expenseMap = new Map<string, Prisma.Decimal>();
    expenses.forEach((e) => {
      if (e.categoryId) expenseMap.set(e.categoryId, e._sum.amount || new Prisma.Decimal(0));
    });

    let totalAllocated = new Prisma.Decimal(0);
    let totalSpent = new Prisma.Decimal(0);

    const detailedCategories = budget.categories.map((bc) => {
      const allocated = bc.allocated;
      const spent = expenseMap.get(bc.categoryId) || new Prisma.Decimal(0);
      const remaining = allocated.sub(spent);
      const percentageUsed = allocated.gt(0)
        ? Math.round((spent.toNumber() / allocated.toNumber()) * 100)
        : 0;

      totalAllocated = totalAllocated.add(allocated);
      totalSpent = totalSpent.add(spent);

      return {
        id: bc.id,
        categoryId: bc.categoryId,
        categoryName: bc.category.name,
        icon: bc.category.icon,
        allocated: allocated.toNumber(),
        spent: spent.toNumber(),
        remaining: remaining.toNumber(),
        percentageUsed,
        isNearLimit: percentageUsed >= 80 && percentageUsed <= 100,
        isExceeded: percentageUsed > 100,
      };
    });

    return {
      budgetId: budget.id,
      month,
      year,
      totalAllocated: totalAllocated.toNumber(),
      totalSpent: totalSpent.toNumber(),
      totalRemaining: totalAllocated.sub(totalSpent).toNumber(),
      categories: detailedCategories,
    };
  }
}