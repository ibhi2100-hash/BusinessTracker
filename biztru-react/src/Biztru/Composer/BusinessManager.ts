import { BusinessBootstrapper } from "../../offline/bootstrap/BusinessBootstrap"; 
import { BusinessApplication } from "./BusinessApplicationComposer";
import type{ BusinessManagerContract } from "./BusinessManagerContract";
import { ApplicationContext } from "./context/ApplicationContext";
import type{ Lifecycle } from "../offline/sqlite/lifecycle/LifeCycle";
import { SyncApplicationService } from "../services/ApplicationService/API/sync/SyncApplicationService";
export interface KnownBusiness {
    id: string
}
export class BusinessManager
implements BusinessManagerContract, Lifecycle{
    private readonly applications = new Map<string, BusinessApplication>()

    private readonly booting =
    new Map<string, Promise<BusinessApplication>>();
    private readonly knownBusinesses = new Map<string, KnownBusiness>();

    private readonly client: ApplicationContext;
    private readonly bootstrapper: BusinessBootstrapper;
    constructor(
        client: ApplicationContext,
        bootstrapper: BusinessBootstrapper
    ) {
        this.client = client;
        this.bootstrapper = bootstrapper;
    }

    private currentBusinessId?: string 

    private syncService: SyncApplicationService | null = null;

        setSyncService(service: SyncApplicationService) {
            this.syncService = service;
        }

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
            console.log(
                "[BUSINESS MANAGER BOOTSTRAP]",
                businessId
            );
            const existing = this.applications.get(businessId);

            if(existing){
                this.currentBusinessId = businessId;
                await this.syncService?.attachToCurrentBusiness();
                return existing
            }

            const existingBoot = this.booting.get(businessId);

            if(existingBoot){
                const app = await existingBoot;

                this.currentBusinessId = businessId;

                await this.syncService?.attachToCurrentBusiness();

                return app;
            }
            const bootPromise = 
                this.bootstrapper
                    .bootstrap(
                        this.client,
                        businessId
                    );

            this.booting.set(
                businessId,
                bootPromise
            );
             try {

            const app =
                await bootPromise;

            this.applications.set(
                businessId,
                app
            );

            this.currentBusinessId =
                businessId;

            await this.syncService
                ?.attachToCurrentBusiness();

            return app;

        } finally {

            this.booting.delete(
                businessId
            );
        }
        }

        async open(businessId: string): Promise<BusinessApplication> {
            const existing = 
                this.applications.get(
                    businessId
                )
                if(existing){
                    this.currentBusinessId= businessId;
                    await this.syncService?.attachToCurrentBusiness();
                    return existing
                }
                
                
                return await this.bootstrap(
                        businessId
                    )

               
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

        get(businessId: string): BusinessApplication {
            const app = this.applications.get(
                businessId
            );
            if (!app) {
                throw new Error(`Business application not found for ID: ${businessId}`);
            }
            return app;
        }

        current(): BusinessApplication | undefined {

            if (!this.currentBusinessId) {
                return undefined;
            }

            return this.applications.get(
                this.currentBusinessId
            );
        }

        async switch(businessId: string): Promise<BusinessApplication> {
            const app = await this.open(businessId);
                await this.client.repositories.knownNode.setCurrentBusiness();
                this.currentBusinessId = businessId;
                await this.syncService?.attachToCurrentBusiness();
                return app;
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