import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";
import { BusinessManager } from "../../Composer/BusinessManager"
import { OnboardingApi } from "./API/onboarding/OnboardinApi";
import { EventStoreApi } from "./API/EventStoreApi";
import { ProductApi } from "./API/Product/ProductApi";
import { InventoryApi } from "./API/Inventory/InventoryApi";
import { SalesApi } from "./API/Sales/SalesApi";

export class Application {
    readonly onboarding: OnboardingApi;
    readonly product: ProductApi;
    readonly inventory: InventoryApi;
    readonly sales: SalesApi
    readonly client: ApplicationContext;
    readonly eventStore: EventStoreApi;
    
    constructor(
        client: ApplicationContext,
        private readonly manager: BusinessManager

    ){
        this.client = client;

        this.onboarding = 
            new OnboardingApi(
                this.manager
            )
        this.eventStore = 
            new EventStoreApi(
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
        
    }
}
