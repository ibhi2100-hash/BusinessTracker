import { LiabilityType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export interface CreateLiabilityDto{
    title: string;
    type:  LiabilityType;
    principalAmount: number;
    interestRate?: number;
    startDate?: Date;
    dueDate?: Date;
    
}