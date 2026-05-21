import { Branch, Business } from "@/types/types";
import { BaseRepo } from "../baseRepo/baseRepo";
import { nanoid } from "nanoid";

export class BusinessRepo extends BaseRepo {
  async createBusiness(businessData: Business, branchData: Branch) {
    const now = new Date();

    return this.tx(
      async () => {
        // 🔒 prevent duplicate onboarding
        const existing = await this.db.businesses.toArray();
        if (existing.length > 0) {
          throw new Error("Business already exists for this account");
        }

        const businessId = nanoid();
        const branchId = nanoid();

        await this.db.businesses.add({
          id: businessId,
          name: businessData.name,
          address: businessData.address ?? null,
          userId: businessData.userId,
          createdAt: now,
          isOnboarding: businessData.isOnboarding,
          onboardingCompleted: businessData.onboardingCompleted,
          status: businessData.status
        });

        await this.db.branches.add({
          id: branchId,
          businessId,
          name: branchData.name ?? "Main Branch",
        });

        return { businessId, branchId };
      },
      this.db.businesses,
      this.db.branches
    );
  }

  async getBusinessData() {
    return this.tx(
      async () => {
        const businesses = await this.db.businesses.toArray();
        const branches = await this.db.branches.toArray();

        return {
          business: businesses[0] ?? null,
          branches,
        };
      },
      this.db.businesses,
      this.db.branches
    );
  }
}