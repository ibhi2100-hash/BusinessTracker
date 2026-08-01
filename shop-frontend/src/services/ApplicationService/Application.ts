import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";
import { BusinessManager } from "../../Composer/BusinessManager"
import { OnboardingApi } from "./API/OnboardinApi";

export class Application {
    readonly onboarding: OnboardingApi;
    readonly client: ApplicationContext;
    
    constructor(
        client: ApplicationContext,
        private readonly manager: BusinessManager
    ){
        this.client = client;

        this.onboarding = 
            new OnboardingApi(
                this.manager
            )
        
    }
}
