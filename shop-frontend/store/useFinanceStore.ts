import { create } from "zustand";

export interface Asset {
    id: string;
    businessId: string;
    branchId: string;
    name: string;
    purchaseCost: number;
    purchaseDate?: Date
    assetType: "OPENING" | "PURCHASE" | "SALE";
    totalCost: number;
    currentValue: number;
    quantity: number;
    isOpening: boolean | true;
    condition?: string;
    supplier?: string;
    usefulLifeMonths: number | 0;
    salvageValue?: number | 0;
    accumulatedDepreciation?: number | 0;
    disposedAt?: Date ;
    disposalAmount?: number | 0;
    createdAt: Date;
    updatedAt?: Date;
}
export interface Liability {
    id: string | null;
    businessId:     string | null;
    branchId:       string |null;
    title:        string
    type:     "LOAN" |"CREDIT" | "SALARY_ADVANCE"
    principalAmount:     number | 0;
    interestRate?:  number | 0;
    startDate:      Date;
    dueDate?:       Date
    lender?:        string
    outstandingAmount:  number | 0;
    description?:   string
    isOpening:      boolean | true
    status:     "ACTIVE" | "SETTLED";
    createdAt:    Date
    updatedAt:    Date
}

export interface Expenses {
    id:            string;
    businessId:    string | null;
    branchId:      string | null;
    categoryId:    string | null;
    amount:        number | 0;
    paymentMethod:  "CASH" | "TRANSFER" | "POS";
    reference?:    string;
    supplier?:      string;
    status:        "APPROVED" | "PENDING" | "CANCELLED";
    description?:  string;
    date:          Date;
    createdAt:     Date; 
    updatedAt:     Date; 
}

interface FinanceState {
    assets:  Asset[];
    liabilities: Liability[];
    expenses: Expenses[];

    setAsset: (assets: Asset[])=> void;
    setLiability: (liabilities: Liability[])=> void;
    setExpense: (expenses: Expenses[])=> void;
};

export const FinanceStore = create<FinanceState>((set)=> ({
    assets: [],
    liabilities: [],
    expenses: [],

    setAsset: (assets) => set({ assets}),
    setLiability: (liabilities)=> set({ liabilities}),
    setExpense: (expenses)=> set({ expenses})
}))