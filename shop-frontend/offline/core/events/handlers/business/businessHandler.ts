import { AppDB } from "@/src/db";
import { BaseEvent } from "../../types";


export const handleBusiness = async (db: AppDB, event: BaseEvent ) => {
    const { business, branch } = event.payload;

    const existingBusiness = await db.businesses.get(business.id);
    const existingBranch = await db.branches.get(branch.id);

    if (existingBusiness) {
        throw new Error("Business already exists");
        }

        if (existingBranch) {
        throw new Error("Branch already exists");
        }
        console.log("This is the business before its added to database", business, " and this is the branch ", branch)

    await db.businesses.add(business);
    await db.branches.add(branch)
}
