export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface BudgetStatus {
  id: string;
  categoryId: string;
  categoryName: string;
  icon: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isNearLimit: boolean;
  isExceeded: boolean;
}

export interface DashboardTransaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: string;
  description: string;
  notes: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  account: {
    name: string;
  };
  category: {
    name: string;
    icon?: string;
  } | null;
}

export interface DashboardSummary {
  netBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  categoryBreakdown: CategoryBreakdown[];
  budgetStatus: BudgetStatus[];
  recentTransactions: DashboardTransaction[];
}