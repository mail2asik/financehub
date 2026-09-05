import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateRecurringDto } from './dto/recurring.dto';
import { Prisma, RecurrenceFrequency } from '@prisma/client';

@Injectable()
export class RecurringService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async create(userId: string, dto: CreateRecurringDto) {
    const startDate = new Date(dto.startDate);

    return this.prisma.recurringTransaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        toAccountId: dto.toAccountId || null,
        categoryId: dto.categoryId || null,
        type: dto.type,
        amount: new Prisma.Decimal(dto.amount),
        description: dto.description,
        frequency: dto.frequency,
        startDate,
        nextExecutionDate: startDate,
      },
    });
  }

  async processDueRecurringTransactions() {
    const now = new Date();

    const dueRules = await this.prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextExecutionDate: { lte: now },
      },
    });

    for (const rule of dueRules) {
      // Create the actual transaction record and adjust account balance
      await this.transactionsService.create(rule.userId, {
        accountId: rule.accountId,
        toAccountId: rule.toAccountId || undefined,
        categoryId: rule.categoryId || undefined,
        type: rule.type,
        amount: rule.amount.toNumber(),
        description: `[Recurring] ${rule.description}`,
        transactionDate: rule.nextExecutionDate.toISOString(),
      });

      // Compute next execution date based on frequency
      const nextDate = new Date(rule.nextExecutionDate);
      if (rule.frequency === RecurrenceFrequency.DAILY) {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (rule.frequency === RecurrenceFrequency.WEEKLY) {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (rule.frequency === RecurrenceFrequency.MONTHLY) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (rule.frequency === RecurrenceFrequency.YEARLY) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      // Update the recurring rule with the next execution date
      await this.prisma.recurringTransaction.update({
        where: { id: rule.id },
        data: { nextExecutionDate: nextDate },
      });
    }

    return { processedCount: dueRules.length };
  }
}