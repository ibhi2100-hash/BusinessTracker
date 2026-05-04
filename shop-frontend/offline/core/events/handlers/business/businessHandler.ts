import { AppDB } from "@/src/db";
import { BaseEvent } from "../../types";


export const BusinessHandler = {

    async create (db: AppDB, event: BaseEvent ) {
        const { business, branch } = event.payload;

        const existingBusiness = await db.businesses.get(business.id);
        const existingBranch = await db.branches.get(branch.id);

        if (existingBusiness) {
            throw new Error("Business already exists");
            }

            if (existingBranch) {
            throw new Error("Branch already exists");
            }
            

        await db.businesses.add({
            ...business,
            userId: event.userId,
            createdAt: Date.now(),
            isOnboarding: true,
            onboardingCompleted: false,
            status: "ONBOARDING"
        });
        await db.branches.add({
            ...branch,
            businessId: business.id,
            isActive: true,
            isDefault: true,
            createdAt: Date.now()
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
