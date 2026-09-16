
import { apiFetch } from "@/lib/api";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { Business } from "@business/shared-types";

export interface BootstrapBusiness {
    businessId: any
    branchId: any,
    accessToken: any
}
export class BusinessApi {
    constructor(
        private readonly manager: BusinessManager
    ){}
   

    async CurrentBusiness(businessId: string): Promise<Business | null>{
        
        
        const app = await this.manager.current();

        const business =  await app.storage.repositories.business.findById(businessId)

         return business

    }

    async BootstrapBusiness(request: BootstrapBusiness):Promise<void> {
        const data = {
            businessId: request.businessId,
            branchId: request.branchId
        }
        const res = await apiFetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/sync/bootstrap`,
                            {
                                method: "POST",
        
                                body: JSON.stringify(
                                    data
                                ),
                            }
                        );

        const result =await res.json();

        console.log("This is the Bootstrap: ", result)
    }
}