import { LiabilityType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export interface Liability {
    id: string;
    businessId: string;
    title: string;
    type: LiabilityType;
    principalAmount: number;
    interestRate?: number | null;
    startDate: Date;
    dueDate?: Date;
    lender: string;
    outstandingAmount: number;
    description?: string;
    status: "ACTIVE" |"SETTLED"
    createdAt: Date;
    updatedAt: Date;

}