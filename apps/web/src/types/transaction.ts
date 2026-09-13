export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface TransactionAccount {
  id: string;
  name: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  type: TransactionType;
  amount: string;
  description: string;
  notes: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  account: TransactionAccount;
  toAccount: TransactionAccount | null;
  category: TransactionCategory | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchTransactionsResponse {
  items: Transaction[];
  meta: PaginationMeta;
}

export interface CreateTransactionPayload {
  accountId: string;
  toAccountId?: string | null;
  categoryId?: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: string;
}