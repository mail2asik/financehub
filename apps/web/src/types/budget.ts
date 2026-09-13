export interface BudgetCategory {
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

export interface Budget {
  budgetId: string;
  month: number;
  year: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  categories: BudgetCategory[];
}

export interface BudgetCategoryPayload {
  categoryId: string;
  allocated: number;
}

export interface CreateBudgetPayload {
  month: number;
  year: number;
  categories: BudgetCategoryPayload[];
}