export type AccountType = 'BANK' | 'CASH' | 'CREDIT_CARD' | 'WALLET' | 'INVESTMENT' | 'LOAN';
export type AccountCurrency = 'INR' | 'USD' | 'CAD' | 'AUD' | 'SGD';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: string;
  currency: AccountCurrency;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSummary {
  netBalance: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface FetchAccountsResponse {
  summary: AccountSummary;
  accounts: Account[];
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  initialBalance: number;
  currency: AccountCurrency;
}

export interface UpdateAccountPayload {
  name: string;
  type: AccountType;
}