import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { AccountType, Prisma } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        balance: new Prisma.Decimal(dto.initialBalance || 0),
        currency: dto.currency || 'INR',
      },
    });
  }

  async findAllByUser(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate overall balance summaries
    const totalAssets = accounts
      .filter(
        (a) =>
          a.type !== AccountType.CREDIT_CARD && a.type !== AccountType.LOAN,
      )
      .reduce((sum, a) => sum.add(a.balance), new Prisma.Decimal(0));

    const totalLiabilities = accounts
      .filter(
        (a) =>
          a.type === AccountType.CREDIT_CARD || a.type === AccountType.LOAN,
      )
      .reduce((sum, a) => sum.add(a.balance), new Prisma.Decimal(0));

    const netBalance = totalAssets.sub(totalLiabilities);

    return {
      summary: {
        netBalance: netBalance.toNumber(),
        totalAssets: totalAssets.toNumber(),
        totalLiabilities: totalLiabilities.toNumber(),
      },
      accounts,
    };
  }

  async findOne(userId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async update(userId: string, accountId: string, dto: UpdateAccountDto) {
    await this.findOne(userId, accountId); // Ensures account exists and belongs to user

    return this.prisma.account.update({
      where: { id: accountId },
      data: dto,
    });
  }

  async archive(userId: string, accountId: string) {
    await this.findOne(userId, accountId);

    return this.prisma.account.update({
      where: { id: accountId },
      data: { isArchived: true },
    });
  }
}