import { SQLiteApplicationStateRepository } from "@/src/offline/sqlite/clientDatabase/repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository"; 

export class ContextApi {
    constructor(
        private readonly applicationState: SQLiteApplicationStateRepository
    ) {}

    async current() {

        const state =
            await this.applicationState.current();
        return {
            businessId:
                state?.currentBusinessId ?? undefined,

            branchId:
                state?.currentBranchId ?? undefined,
        };
    }

    async setActiveBusiness(
        businessId: string
    ): Promise<void> {
        await this.applicationState.setCurrentBusiness(
            businessId
        );
    }

    async setActiveBranch(
        branchId: string
    ): Promise<void> {
        await this.applicationState.setCurrentBranch(
            branchId
        );
    }

    async clear(): Promise<void> {
        await this.applicationState.clearSession();
    }
}