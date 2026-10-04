
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import type { DashboardSummary } from "@business/shared-types";



export class DashboardApi {
    private readonly manager: BusinessManager;
    constructor(
        manager: BusinessManager
    ) {
        this.manager = manager;
    }
    async getSummary(branchId: string): Promise<DashboardSummary | null>{
        const app = await this.manager.current();
        if(!app){
            throw new Error("Business Does not Exist in DashoboardApi")
        }
        const summary = await app.storage.repositories.dashboard.getSummary(branchId);

        return summary
    }
}