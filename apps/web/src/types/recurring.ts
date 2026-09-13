export type RecurringTransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  type: RecurringTransactionType;
  amount: string | number; // Handling string/number mismatch from API
  description: string;
  frequency: RecurringFrequency;
  startDate: string; // ISO string
  nextExecutionDate: string; // ISO string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringPayload {
  accountId: string;
  toAccountId?: string | null; // Optional but mandatory based on 'type'
  categoryId?: string | null;
  type: RecurringTransactionType;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  startDate: string; // YYYY-MM-DD
}