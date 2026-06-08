import { Role } from "../enums/Role";
export type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    businessId?: string;
    branchId?: string;
    onboardingCompleted?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};
