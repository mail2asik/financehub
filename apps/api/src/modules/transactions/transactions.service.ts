import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/transaction.dto';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const amountDecimal = new Prisma.Decimal(dto.amount);

    return this.prisma.$transaction(async (tx) => {
      // Verify source account ownership
      const sourceAccount = await tx.account.findFirst({
        where: { id: dto.accountId, userId },
      });
      if (!sourceAccount) {
        throw new NotFoundException('Source account not found');
      }

      // Process Transfer Type
      if (dto.type === TransactionType.TRANSFER) {
        if (!dto.toAccountId) {
          throw new BadRequestException('Destination account is required for transfers');
        }
        if (dto.accountId === dto.toAccountId) {
          throw new BadRequestException('Cannot transfer to the same account');
        }

        const destAccount = await tx.account.findFirst({
          where: { id: dto.toAccountId, userId },
        });
        if (!destAccount) {
          throw new NotFoundException('Destination account not found');
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
      return tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          toAccountId: dto.toAccountId || null,
          categoryId: dto.categoryId || null,
          type: dto.type,
          amount: amountDecimal,
          description: dto.description,
          notes: dto.notes,
          transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date(),
        },
      });
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
}