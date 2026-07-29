export type Business = {
    id: string;
    userId: string;
    name: string;
    address?: string;
    createdAt?: number;
    activatedAt?: number;
    isOnboarding?: boolean;
    onboardingCompleted?: boolean;
    status?: "ONBOARDING" | "ACTIVE" | "SUSPENDED";
};
