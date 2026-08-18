import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";
import { BusinessManager } from "../../Composer/BusinessManager"
import { OnboardingApi } from "./API/onboarding/OnboardinApi";
import { ProductApi } from "./API/Product/ProductApi";
import { InventoryApi } from "./API/Inventory/InventoryApi";
import { SalesApi } from "./API/Sales/SalesApi";
import { RebuildApi } from "./API/rebuild/RebuildApi";
import { ContextApi } from "./API/context/context";
import { CapitalApi } from "./API/capital/capitalApi";
import { BranchApi } from "./API/branch/branchApi";
import { DashboardApi } from "./API/dashboard/DashboradApi";
import { ReportApi } from "./API/report/ReportApi";
import { BusinessApi } from "./API/business/BusinessApi";

export class Application {
    readonly onboarding: OnboardingApi;
    readonly business: BusinessApi;
    readonly branch: BranchApi;
    readonly product: ProductApi;
    readonly inventory: InventoryApi;
    readonly sales: SalesApi
    readonly client: ApplicationContext;
    readonly rebuild: RebuildApi;
    readonly context: ContextApi;
    readonly capital: CapitalApi;
    readonly dashboard: DashboardApi;
    readonly report: ReportApi;


    
    constructor(
        client: ApplicationContext,
        private readonly manager: BusinessManager

    ){
        this.client = client;

        this.onboarding = 
            new OnboardingApi(
                this.manager
            )
        
        this.branch = 
            new BranchApi(
                this.manager
            )
            
        this.product = 
            new ProductApi(
                this.manager
            )
        
        this.inventory = 
            new InventoryApi(
                this.manager
            )

        this.sales = 
            new SalesApi(
                this.manager
            )

        this.rebuild = 
            new RebuildApi(
                this.manager
            )
        
        this.context = 
            new ContextApi(
                this.manager
            )

        this.capital = 
            new CapitalApi(
                this.manager
            )

        this.dashboard = 
            new DashboardApi(
                this.manager
            )

        this.report = 
            new ReportApi(
                this.manager
            )
        this.business = 
            new BusinessApi(
                this.manager
            )
    }
}
