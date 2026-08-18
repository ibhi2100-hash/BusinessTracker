import { AggregateType } from "@/offline/domain/aggregate";
import { CommandIntent } from "@/src/BizTru_Karnel/CommandFactory/CommandIntent";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { DashboardSummary, InventoryEventType } from "@business/shared-types";
import { LiveProduct } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";


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