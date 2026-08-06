import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";
import { BusinessManager } from "../../Composer/BusinessManager"
import { OnboardingApi } from "./API/OnboardinApi";
import { EventStoreApi } from "./API/EventStoreApi";

export class Application {
    readonly onboarding: OnboardingApi;
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
        
    }
}
