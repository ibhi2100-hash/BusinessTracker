export type Branch = {
    id: string;
    businessId: string;
    name: string;
    address: string | null;
    phone: string | null;
    isActive: boolean;
    isDefault: boolean;
    createdAt: number;
};
