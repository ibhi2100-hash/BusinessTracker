export interface BusinessContextProvider {
    current(): Promise<BusinessContext>;

    setActiveBusiness(businessId: string): Promise<void>;

    setActiveBranch(branchId: string): Promise<void>;
}

export interface BusinessContext {
    businessId: string;
    branchId?: string;
}