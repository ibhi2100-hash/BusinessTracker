import { BusinessManager } from "@/src/Composer/BusinessManager";
import { PeriodFilter } from "@business/shared-types";


export class ReportApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
    async getPeriodSummary(branchId: string, period: PeriodFilter){
        const app = await this.manager.current();

        const summary = await app.storage.repositories.report.getPeriodSummary(branchId, period)

        return summary
    }
}