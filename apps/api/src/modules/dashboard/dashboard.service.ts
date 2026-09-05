import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { BudgetsService } from '../budgets/budgets.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private accountsService: AccountsService,
    private budgetsService: BudgetsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getSummary(userId: string) {
    const cacheKey = `dashboard:summary:${userId}`;
    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // Account Balances Overview
    const accountData = await this.accountsService.findAllByUser(userId);

    // Income & Expense totals for current month
    const monthlyTotals = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    monthlyTotals.forEach((group) => {
      if (group.type === TransactionType.INCOME) {
        monthlyIncome = group._sum.amount?.toNumber() || 0;
      } else if (group.type === TransactionType.EXPENSE) {
        monthlyExpenses = group._sum.amount?.toNumber() || 0;
      }
    });

    // Category Expenses Breakdown
    const categoryExpenses = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const categoryIds = categoryExpenses
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const categoryBreakdown = categoryExpenses.map((item) => {
      const amount = item._sum.amount?.toNumber() || 0;
      const percentage = monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 100) : 0;
      return {
        categoryId: item.categoryId,
        categoryName: item.categoryId ? categoryMap.get(item.categoryId) || 'Uncategorized' : 'Uncategorized',
        amount,
        percentage,
      };
    });

    // Budget Usage Status
    const budgetStatus = await this.budgetsService.getBudgetDetails(userId, currentMonth, currentYear);

    // Recent Transactions
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true, icon: true } },
      },
      orderBy: { transactionDate: 'desc' },
      take: 5,
    });

    const result = {
      netBalance: accountData.summary.netBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings: monthlyIncome - monthlyExpenses,
      categoryBreakdown,
      budgetStatus: budgetStatus.categories,
      recentTransactions,
    };

    // Cache result in Redis for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }

  async invalidateCache(userId: string) {
    const cacheKey = `dashboard:summary:${userId}`;
    await this.cacheManager.del(cacheKey);
  }
}