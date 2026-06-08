export type Business = {
    id: string;
    userId: string;
    name: string;
    address?: string;
    createdAt?: Date;
    activatedAt?: Date;
    isOnboarding?: boolean;
    onboardingCompleted?: boolean;
    status?: "ONBOARDING" | "ACTIVE" | "SUSPENDED";
};
