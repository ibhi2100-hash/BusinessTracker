import { SQLiteApplicationStateRepository } from "@/src/offline/sqlite/clientDatabase/repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository";
import { BusinessContext, BusinessContextProvider } from "./BusinessContextContract";
// FrontendBusinessContext.ts
export class FrontendBusinessContext implements BusinessContextProvider {
  private businessId?: string;
  private branchId?: string;

  constructor(
    private readonly repository: SQLiteApplicationStateRepository
  ) {}

  async current(): Promise<BusinessContext> {
    if (this.businessId && this.branchId) {
      return { businessId: this.businessId, branchId: this.branchId };
    }

    const state = await this.repository.current();
    this.businessId = state.currentBusinessId ?? undefined;
    this.branchId = state.currentBranchId ?? undefined;

    return {
      businessId: this.businessId,
      branchId: this.branchId,
    };
  }

  /** Call this when the user switches branch */
  async setActive(branchId: string): Promise<void> {
    await this.repository.setCurrentBranch(branchId);
    this.branchId = branchId;
  }

  /** Optional: clear cache after logout / business switch */
  clearCache() {
    this.businessId = undefined;
    this.branchId = undefined;
  }
}