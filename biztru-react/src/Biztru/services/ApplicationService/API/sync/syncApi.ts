
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import { BusinessSynchronization } from "../../../../offline/sqlite/businessDatabase/synchronization/BusinessSynchronization"; 


export class SyncApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
   

    async Sync(): Promise<BusinessSynchronization | null>{
        
        
        const app = await this.manager.current();

        if(!app) {
            return null
        }
        await app.synchronization.syncNow();

        return app.synchronization
    }

  

}