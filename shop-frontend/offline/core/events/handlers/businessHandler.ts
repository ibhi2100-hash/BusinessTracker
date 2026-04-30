import { AppDB, getDb } from "@/src/db";
import { BaseEvent } from "../types";
import { AppWindowIcon } from "lucide-react";

export const handleBusiness = async (db: AppDB, event: BaseEvent ) => {
    const { business, branch } = event.payload;

    const existingBusiness = await db.businesses
        .where("[id]")
        .equals([business.id])
        .first();

    const existingBranch = await db.branches
        .where("[id]")
        .equals([branch.id])
        .first();

    if(existingBusiness && existingBranch) {
        throw new Error("Business or Branch already exists");
    }

    await db.businesses.add(business);
    await db.branches.add(branch)
}
