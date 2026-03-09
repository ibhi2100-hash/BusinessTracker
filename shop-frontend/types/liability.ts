// types/liability.ts

export type LiabilityStatus = "ACTIVE" | "SETTLED";

export interface Liability {
  id: string;
  title: string;
  type: string;
  principalAmount: number;
  interestRate?: number | null;
  startDate: string;
  dueDate?: string | null;
  outstandingAmount: number;
  status: LiabilityStatus;
}

export interface CreateLiabilityInput {
  title: string;
  type: string;
  principalAmount: number;
  interestRate?: number;
  startDate?: string;
  dueDate?: string;
}

export interface RepayLiabilityInput {
  amount: number;
  paymentDate?: string;
}