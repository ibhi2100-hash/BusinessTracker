
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import type { DashboardSummary } from "@business/shared-types";



export class DashboardApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async getSummary(branchId: string): Promise<DashboardSummary | null>{
        const app = await this.manager.current();

        const summary = await app.storage.repositories.dashboard.getSummary(branchId);

        return summary
    }
}