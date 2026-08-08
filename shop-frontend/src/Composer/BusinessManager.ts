import { BusinessBootstrapper } from "@/offline/bootstrap/BusinessBootstrap";
import { BusinessApplication } from "./BusinessApplicationComposer";
import { BusinessManagerContract } from "./BusinessManagerContract";
import { ApplicationContext } from "./context/ApplicationContext";
import { Business } from "@business/shared-types";
import { Lifecycle } from "../offline/sqlite/lifecycle/LifeCycle";

export class BusinessManager
implements BusinessManagerContract, Lifecycle{
    private readonly applications = 
        new Map<string, BusinessApplication>()

    private readonly knownBusinesses = new Map<string, KnownBusiness>();

    
    constructor(
        private readonly client: ApplicationContext,
        private readonly bootstrapper: BusinessBootstrapper
    ){}

    private currentBusinessId?: string 

    async initialize() {

        const businesses =
            await this.client.repositories
                .knownNode
                .findAll();

        for (const business of businesses) {

            this.knownBusinesses.set(
                business.id,
                business
            );
        }

        const current =
            await this.client.repositories
                .currentBusiness
                .find();

        if (current?.businessId) {

            this.currentBusinessId =
                current.businessId;
        }
    }
    async start(): Promise<void> {
        if(!this.currentBusinessId){
            return
        }
        await this.open(
            this.currentBusinessId
        )
    }

    async stop(): Promise<void> {
        
    }
    async bootstrap(businessId: string): Promise<BusinessApplication> {
        
            const app = 
                await this.bootstrapper.bootstrap(
                    this.client,
                    businessId
                );
            
            this.applications.set(
                businessId,
                app
            )

            

            this.currentBusinessId = 
                businessId

            return app
        }

        async open(businessId: string): Promise<BusinessApplication> {
            const existing = 
                this.applications.get(
                    businessId
                )
                if(existing){
                    return existing
                }
                const app = 
                    await this.bootstrap(
                        businessId
                    )

                    this.applications.set(
                        businessId,
                        app
                    )
                return app
        }

        async close(businessId: string): Promise<void> {
            const app = 
                this.applications.get(
                    businessId
                )
            if(!app){
                return
            }

            await app.dispose();

            this.applications.delete(
                businessId
            )
        }

        get(businessId: string): BusinessApplication | undefined {
            return this.applications.get(
                businessId
            )
        }

        current(): BusinessApplication | undefined {
            
            if(!this.currentBusinessId){
                return undefined
            }
           
            return this.applications.get(
                this.currentBusinessId
            )
        }

        async switch(businessId: string): Promise<BusinessApplication> {
            const app = 
                await this.open(
                    businessId
                )
                await this.client.repositories.knownNode.setCurrentBusiness(
                    businessId
                )

                this.currentBusinessId = 
                    businessId

                return app
        }

        async dispose(): Promise<void> {
            for(const app of this.applications.values()){
                await app.dispose();
            }

            this.applications.clear()

        }

        has(businessId: string): boolean{
            return this.knownBusinesses.has(
                businessId
            )
        }

        known(): readonly KnownBusiness[]{
            return [...this.knownBusinesses.values()];
        }

        running(): readonly BusinessApplication[]{
            return [...this.applications.values()]
        }
}