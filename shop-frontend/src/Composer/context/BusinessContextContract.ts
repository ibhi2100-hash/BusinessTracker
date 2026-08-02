export interface BusinessContextProvider {
    current(): Promise<BusinessContext>;
}

export interface BusinessContext {
    businessId: string;
    branchId?: string;
}