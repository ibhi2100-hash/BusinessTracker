
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { BusinessSynchronization } from "@/src/offline/sqlite/businessDatabase/synchronization/BusinessSynchronization";
import { SyncApplicationService } from "./SyncTypes";
import { SyncManagementState } from "@/app/(app)/(sync-mgt)/sync-management/components/syncMgtPage";



export class SyncApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
   

    async Sync(): Promise<BusinessSynchronization | null>{
        
        
        const app = await this.manager.current();

        if(!app) {
            return null
        }
        return app.synchronization;
    }

  

}