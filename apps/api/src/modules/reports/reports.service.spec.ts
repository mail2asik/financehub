import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockPrisma = {
    transaction: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should calculate net savings accurately from transactions', async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([
      {
        type: TransactionType.INCOME,
        amount: new Prisma.Decimal(5000),
        transactionDate: new Date(),
        description: 'Salary',
        account: { name: 'Main' },
        category: null,
      },
      {
        type: TransactionType.EXPENSE,
        amount: new Prisma.Decimal(1500),
        transactionDate: new Date(),
        description: 'Rent',
        account: { name: 'Main' },
        category: { name: 'Housing' },
      },
    ]);

    const report = await service.getMonthlyReportData('user-1', 9, 2026);

    expect(report.totalIncome).toBe(5000);
    expect(report.totalExpense).toBe(1500);
    expect(report.netSavings).toBe(3500);
  });
});