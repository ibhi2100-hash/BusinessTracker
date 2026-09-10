import { SQLiteApplicationStateRepository } from "@/src/offline/sqlite/clientDatabase/repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository";
import { BusinessContext, BusinessContextProvider } from "./BusinessContextContract";
// FrontendBusinessContext.ts
export class FrontendBusinessContext
    implements BusinessContextProvider {

    private businessId?: string;
    private branchId?: string;

    constructor(
        private readonly repository: SQLiteApplicationStateRepository
    ) {}

    async current(): Promise<BusinessContext> {
        if (this.businessId !== undefined) {
            const state = await this.repository.current();

            if (
                state.currentBusinessId === this.businessId &&
                state.currentBranchId === this.branchId
            ) {
                return {
                    businessId: this.businessId,
                    branchId: this.branchId,
                };
            }
        }

        const state = await this.repository.current();

        this.businessId = state.currentBusinessId ?? undefined;
        this.branchId = state.currentBranchId ?? undefined;

        return {
            businessId: this.businessId,
            branchId: this.branchId,
        };
    }

    async setActiveBusiness(
        businessId: string
    ): Promise<void> {

        await this.repository.setCurrentBusiness(businessId);

        this.businessId = businessId;
        this.branchId = undefined;
    }

    async setActiveBranch(
        branchId: string
    ): Promise<void> {

        await this.repository.setCurrentBranch(branchId);

        this.branchId = branchId;
    }

    clearCache(): void {
        this.businessId = undefined;
        this.branchId = undefined;
    }
}