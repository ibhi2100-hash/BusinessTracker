import { AppDB } from "@/src/db";
import { BaseEvent } from "../../types";


export const BusinessHandler = {

    async createBusiness (db: AppDB, event: BaseEvent ) {
        const  { id, name, address} = event.payload

        const existingBusiness = await db.businesses.get(id);

        if (existingBusiness) {
            throw new Error("Business already exists");
            }
   

        await db.businesses.add({
            id,
            name,
            address,
            userId: event.userId,
            createdAt: event.createdAt,
            isOnboarding: true,
            onboardingCompleted: false,
            status: "ONBOARDING"
        });
    },
    async createBranch(db: AppDB, event: BaseEvent){
        const { id, businessId, name, phone } = event.payload

        const existingBranch = await db.branches.get(id);
        if(existingBranch) throw new Error("Branch already Exist")

        await db.branches.add({
            id,
            name,
            phone,
            businessId,
            isActive: true,
            isDefault: true,
            createdAt: event.createdAt

        })
    },
    async activate(db: AppDB, event: BaseEvent){
        const existing =await db.businesses.get(event.businessId);
        
        if(existing){
        await db.businesses.update(existing.id, {
            activatedAt: Date.now(),
            isOnboarding: false,
            onboardingCompleted: true,
            status: "ACTIVE"
        });
        await db.users.update(existing.userId, {
            onboardingCompleted: true,
            businessId: existing.id
        })
    }
    }

}
