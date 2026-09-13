export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  icon: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  type?: CategoryType;
  icon?: string;
}