import { BusinessApplicationContract } from "./context/BusinessApplicationContract";
import { BusinessStorage } from "../offline/sqlite/businessDatabase/storage/BusinessStorage";
import { Lifecycle } from "../offline/sqlite/lifecycle/LifeCycle";
import { BusinessDomain } from "../offline/sqlite/businessDatabase/domain/BusinessDomain";
import { BusinessSynchronization } from "../offline/sqlite/businessDatabase/synchronization/BusinessSynchronization";
import { BusinessRuntime } from "../storage/runtime/BusinessRuntime";
import { ProjectionRebuilder } from "../offline/sqlite/businessDatabase/projections/rebuild/ProjectionRebuilder";
import { ProjectionRebuildOptions, ProjectionRebuildResult } from "../offline/sqlite/businessDatabase/projections/rebuild/types";
import { BusinessContextProvider } from "./context/BusinessContextContract";




export class BusinessApplication
implements  BusinessApplicationContract,
            Lifecycle {

    constructor(

        readonly businessId: string,

        public context: BusinessContextProvider,

        readonly runtime: BusinessRuntime,

        readonly storage: BusinessStorage,

        readonly domain: BusinessDomain,

        readonly synchronization: BusinessSynchronization,

        readonly rebuilder: ProjectionRebuilder


    ) {}

    async rebuildProjections(
    options: ProjectionRebuildOptions = {}
  ): Promise<ProjectionRebuildResult> {
    return this.rebuilder.rebuild(options);
  }

    async initialize(): Promise<void> {
        await this.runtime.initialize();

        await this.storage.initialize();
        
        await this.domain.initialize();

        await this.synchronization.initialize()
    }

    async start(): Promise<void> {
        await this.runtime.start();

        await this.storage.start();
       
        await this.domain.start();

        await this.synchronization.start()
    }

    async stop(): Promise<void> {
        await this.storage.stop();

        await this.domain.stop();

        await this.synchronization.stop()
    }

    async dispose(): Promise<void> {
        await this.stop();

        await this.synchronization.dispose();

        await this.domain.dispose();

        await this.storage.dispose()
    }

}