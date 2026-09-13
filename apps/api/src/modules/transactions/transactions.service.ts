import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { Prisma, TransactionType } from '@prisma/client';
import { BudgetsService } from '../budgets/budgets.service';
import { NotificationsService } from '../../infrastructure/notifications/notifications.service';
import { ApiException } from 'src/common/exceptions/api.exception';
@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private budgetsService: BudgetsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const amountDecimal = new Prisma.Decimal(dto.amount);

    return this.prisma.$transaction(async (tx) => {
      // Verify source account ownership
      const sourceAccount = await tx.account.findFirst({
        where: { id: dto.accountId, userId },
      });
      if (!sourceAccount) {
        throw new ApiException(
          'Source account not found',
          'SOURCE_ACCOUNT_NOT_FOUND',
          HttpStatus.NOT_FOUND,
        );
      }

      // Process Transfer Type
      if (dto.type === TransactionType.TRANSFER) {
        if (!dto.toAccountId) {
          throw new ApiException(
            'Destination account is required for transfers',
            'DESTINATION_ACCOUNT_REQUIRED',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (dto.accountId === dto.toAccountId) {
          throw new ApiException(
            'Cannot transfer to the same account',
            'CANNOT_TRANSFER_TO_SAME_ACCOUNT',
            HttpStatus.BAD_REQUEST,
          );
        }

        const destAccount = await tx.account.findFirst({
          where: { id: dto.toAccountId, userId },
        });
        if (!destAccount) {
          throw new ApiException(
            'Destination account not found',
            'DESTINATION_ACCOUNT_NOT_FOUND',
            HttpStatus.NOT_FOUND,
          );
        }

        // Debit source account, Credit destination account
        await tx.account.update({
          where: { id: sourceAccount.id },
          data: { balance: { decrement: amountDecimal } },
        });

        await tx.account.update({
          where: { id: destAccount.id },
          data: { balance: { increment: amountDecimal } },
        });
      } 
      // Process Expense Type
      else if (dto.type === TransactionType.EXPENSE) {
        await tx.account.update({
          where: { id: sourceAccount.id },
          data: { balance: { decrement: amountDecimal } },
        });
      } 
      // Process Income Type
      else if (dto.type === TransactionType.INCOME) {
        await tx.account.update({
          where: { id: sourceAccount.id },
          data: { balance: { increment: amountDecimal } },
        });
      }

      // Create Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          toAccountId: dto.toAccountId || null,
          categoryId: dto.categoryId || null,
          type: dto.type,
          amount: amountDecimal,
          description: dto.description,
          notes: dto.notes,
          transactionDate: dto.transactionDate
            ? new Date(dto.transactionDate)
            : new Date(),
        },
      });

      // Inside TransactionsService after creating an expense transaction:
      if (dto.type === TransactionType.EXPENSE && dto.categoryId) {
        const currentDate = new Date();
        const budgetDetails = await this.budgetsService.getBudgetDetails(
          userId,
          currentDate.getMonth() + 1,
          currentDate.getFullYear(),
        );

        const categoryBudget = (
          budgetDetails.categories as Array<{
            categoryId: string;
            categoryName: string;
            isNearLimit: boolean;
            isExceeded: boolean;
            percentageUsed: number;
            allocated: number;
            spent: number;
          }>
        ).find((c) => c.categoryId === dto.categoryId);
        if (
          categoryBudget &&
          (categoryBudget.isNearLimit || categoryBudget.isExceeded)
        ) {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
          });
          if (user) {
            await this.notificationsService.sendBudgetWarning(
              user.email,
              categoryBudget.categoryName,
              categoryBudget.percentageUsed,
              categoryBudget.allocated,
              categoryBudget.spent,
            );
          }
        }
      }

      return transaction;
    });
  }

  async findAllByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        include: {
          account: { select: { id: true, name: true } },
          toAccount: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, icon: true } },
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    userId: string,
    transactionId: string,
    dto: CreateTransactionDto,
  ) {
    const amountDecimal = new Prisma.Decimal(dto.amount);
    return this.prisma.transaction.update({
      where: { id: transactionId, userId },
      data: {
        accountId: dto.accountId,
        toAccountId: dto.toAccountId || null,
        categoryId: dto.categoryId || null,
        type: dto.type,
        amount: amountDecimal,
        description: dto.description,
        notes: dto.notes,
        transactionDate: dto.transactionDate
          ? new Date(dto.transactionDate)
          : new Date(),
      },
    });
  }

  async remove(userId: string, transactionId: string) {
    return this.prisma.transaction.delete({
      where: { id: transactionId, userId },
    });
  }
}
