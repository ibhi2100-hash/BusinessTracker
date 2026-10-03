import { ApplicationContext } from "../../Composer/context/ApplicationContext";
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
import { SyncApi } from "./API/sync/syncApi";
import { SyncApplicationService } from "./API/sync/SyncApplicationService";
import { ExpenseApi } from "./API/expenses/expensesApi";
import { SessionApi } from "./API/session/ApplicationSession";

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
    readonly expense: ExpenseApi;
    readonly dashboard: DashboardApi;
    readonly report: ReportApi;
    readonly sync: SyncApi;
    readonly syncService: SyncApplicationService
    readonly session: SessionApi;
    private readonly manager: BusinessManager;

    
    constructor(
        client: ApplicationContext,
        manager: BusinessManager

    ){
        this.client = client;
        this.manager = manager;
        this.onboarding = 
            new OnboardingApi(
                manager
            )
        
        this.branch = 
            new BranchApi(
                manager
            )
            
        this.product = 
            new ProductApi(
                manager
            )
        
        this.inventory = 
            new InventoryApi(
                manager
            )

        this.sales = 
            new SalesApi(
                manager
            )

        this.rebuild = 
            new RebuildApi(
                manager
            )
        
        this.context = 
            new ContextApi(
                client.repositories.applicationState
            )

        this.capital = 
            new CapitalApi(
                manager
            )

        this.dashboard = 
            new DashboardApi(
                manager
            )

        this.report = 
            new ReportApi(
                manager
            )

        this.expense = 
            new ExpenseApi(
                manager
            )


        this.business = 
            new BusinessApi(
                manager,
                client.repositories.currentBusiness,
                client.transactionManager
            )

        this.sync = 
            new SyncApi(
                manager
            )

        this.syncService = 
            new SyncApplicationService(
                manager
            )

        this.session = 
            new SessionApi()
    }
}
