import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateGoalDto, AddContributionDto } from './dto/goal.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.savingsGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: new Prisma.Decimal(dto.targetAmount),
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
      },
    });
  }

  async findAllByUser(userId: string) {
    const goals = await this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((goal) => {
      const current = goal.currentAmount.toNumber();
      const target = goal.targetAmount.toNumber();
      const progressPercentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

      return {
        ...goal,
        targetAmount: target,
        currentAmount: current,
        progressPercentage,
      };
    });
  }

  async addContribution(userId: string, goalId: string, dto: AddContributionDto) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    const contributionAmount = new Prisma.Decimal(dto.amount);
    const newCurrentAmount = goal.currentAmount.add(contributionAmount);
    const isCompleted = newCurrentAmount.gte(goal.targetAmount);

    return this.prisma.$transaction(async (tx) => {
      await tx.goalContribution.create({
        data: {
          goalId,
          amount: contributionAmount,
          notes: dto.notes,
        },
      });

      return tx.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrentAmount,
          isCompleted,
        },
      });
    });
  }
}