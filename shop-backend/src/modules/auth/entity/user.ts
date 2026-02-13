import { Role } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    businessId: string | null;
    role: Role;
    isActive: boolean;
    createdAt: Date;

}