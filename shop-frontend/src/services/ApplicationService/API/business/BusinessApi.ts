
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { Business } from "@business/shared-types";


export class BusinessApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
   

    async CurrentBusiness(businessId: string): Promise<Business | null>{
        
        
        const app = await this.manager.current();

        const business =  await app.storage.repositories.business.findById(businessId)

         return business

    }

}