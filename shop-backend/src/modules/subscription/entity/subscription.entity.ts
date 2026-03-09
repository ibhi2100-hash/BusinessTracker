export interface BusinessSubcription {
    id:     string;
    businessId: string;
    subscriptionId: string;
    startedAt:  Date;
    trialEndDate: Date;
    status:  string
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;

    maxUsers: number;
    maxBranch: number;
    maxProduct: number;
    maxStaff: number;
    features: JSON;
    createdAt: Date;
}