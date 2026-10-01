import { Account } from "../enums/Account.js";
export interface LedgerEntry {
    id: string;
    eventId: string;
    businessId: string;
    branchId: string;
    type: string;
    account: Account;
    direction: "DEBIT" | "CREDIT";
    amount: number;
    index: number;
    createdAt: number;
}
