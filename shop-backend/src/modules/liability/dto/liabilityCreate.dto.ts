import { LiabilityType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export type LiabilityCreateInput = {
  title: string;
  type: LiabilityType;
  principalAmount: number;
  interestRate?: number | null;
  startDate: Date;
  dueDate?: Date | null;
  outstandingAmount: number;
  status?: "ACTIVE" | "SETTLED";
};