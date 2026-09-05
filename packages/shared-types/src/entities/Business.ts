export type Business = {
  id: string;
  userId: string | null;
  name: string;
  address: string | null;
  createdAt: number;
  activatedAt: number | null;
  isOnboarding: boolean;
  onboardingCompleted: boolean;
  status: "ONBOARDING" | "ACTIVE" | "SUSPENDED";
}