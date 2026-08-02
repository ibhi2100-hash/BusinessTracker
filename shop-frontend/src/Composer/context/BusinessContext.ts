import { SQLiteApplicationStateRepository } from "@/src/offline/sqlite/clientDatabase/repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository";
import { BusinessContext, BusinessContextProvider } from "./BusinessContextContract";

export class FrontendBusinessContext 
implements BusinessContextProvider {
    private businessId?: string;

    private branchId?:  string;

    constructor(
        private readonly repository: SQLiteApplicationStateRepository
    ){}

    async current(): Promise<BusinessContext> {
        if(this.businessId){
            return {
                businessId: this.businessId,
                branchId: this.branchId
            }   
        }

        const context = 
                await this.repository.current();

        const businessId = context.currentBusinessId;

        const branchId = context.currentBranchId;

        this.businessId = businessId;

        this.branchId = branchId;

        return {
            businessId,
            branchId
        }
    }
}