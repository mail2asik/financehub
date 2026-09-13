// Define interfaces based on the provided API responses

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface ReportTransaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  type: TransactionType;
  amount: string; // API returns string for numbers
  description: string;
  notes: string;
  transactionDate: string; // ISO string
  createdAt: string;
  updatedAt: string;
  account: {
    name: string;
  };
  category: {
    name: string;
  } | null; // Category can be null
}

export interface MonthlyReportData {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactions: ReportTransaction[];
}