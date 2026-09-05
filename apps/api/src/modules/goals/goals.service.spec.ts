import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('GoalsService', () => {
  let service: GoalsService;
  let prisma: PrismaService;

  const mockPrisma = {
    savingsGoal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    goalContribution: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should compute correct goal progress percentages', async () => {
    mockPrisma.savingsGoal.findMany.mockResolvedValue([
      {
        id: 'goal-1',
        userId: 'user-1',
        name: 'Emergency Fund',
        targetAmount: new Prisma.Decimal(1000),
        currentAmount: new Prisma.Decimal(400),
        createdAt: new Date(),
      },
    ]);

    const results = await service.findAllByUser('user-1');

    expect(results[0].progressPercentage).toBe(40);
    expect(results[0].currentAmount).toBe(400);
    expect(results[0].targetAmount).toBe(1000);
  });

  it('should throw NotFoundException if contribution target goal does not exist', async () => {
    mockPrisma.savingsGoal.findFirst.mockResolvedValue(null);

    await expect(
      service.addContribution('user-1', 'invalid-id', { amount: 100 }),
    ).rejects.toThrow(NotFoundException);
  });
});