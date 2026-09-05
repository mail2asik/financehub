import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { TransactionType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyReportData(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
      include: {
        account: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { transactionDate: 'asc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      const amt = t.amount.toNumber();
      if (t.type === TransactionType.INCOME) totalIncome += amt;
      if (t.type === TransactionType.EXPENSE) totalExpense += amt;
    });

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      transactions,
    };
  }

  async generateCsvReport(userId: string, month: number, year: number): Promise<string> {
    const report = await this.getMonthlyReportData(userId, month, year);

    const data = report.transactions.map((t) => ({
      Date: t.transactionDate.toISOString().split('T')[0],
      Type: t.type,
      Description: t.description,
      Amount: t.amount.toNumber(),
      Account: t.account.name,
      Category: t.category?.name || 'N/A',
    }));

    const parser = new Parser({
      fields: ['Date', 'Type', 'Description', 'Amount', 'Account', 'Category'],
    });

    return parser.parse(data);
  }

  async generatePdfReport(userId: string, month: number, year: number): Promise<Buffer> {
    const report = await this.getMonthlyReportData(userId, month, year);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // PDF Header
      doc.fontSize(20).text(`FinanceHub - Monthly Financial Report`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Period: ${month}/${year}`);
      doc.moveDown();

      // Summary Table
      doc.fontSize(12).text(`Total Income: ₹${report.totalIncome.toLocaleString()}`);
      doc.text(`Total Expense: ₹${report.totalExpense.toLocaleString()}`);
      doc.text(`Net Savings: ₹${report.netSavings.toLocaleString()}`);
      doc.moveDown();
      doc.text('--------------------------------------------------');
      doc.moveDown();

      // Transactions Summary List
      doc.fontSize(14).text('Transactions Summary', { underline: true });
      doc.moveDown(0.5);

      report.transactions.forEach((t) => {
        const dateStr = t.transactionDate.toISOString().split('T')[0];
        doc.fontSize(10).text(`${dateStr} | ${t.type} | ${t.description} | ₹${t.amount.toNumber()}`);
      });

      doc.end();
    });
  }
}