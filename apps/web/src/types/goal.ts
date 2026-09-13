/**
 * Basic structure of a Goal as returned by create/contribute APIs.
 */
export interface GoalBase {
  id: string;
  userId: string;
  name: string;
  targetAmount: string | number; // API returns string on create, number on list
  currentAmount: string | number; // API returns string on create, number on list
  targetDate: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enhanced structure of a Goal as returned by the List API.
 */
export interface GoalListItem extends Omit<GoalBase, 'targetAmount' | 'currentAmount'> {
  targetAmount: number; // Ensured number in list
  currentAmount: number; // Ensured number in list
  progressPercentage: number;
}

/**
 * Payload for creating a new goal.
 */
export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
}

/**
 * Payload for contributing to a goal.
 */
export interface ContributeGoalPayload {
  amount: number;
  notes?: string;
}