import { BusinessSessionManager } from "@/src/offline/sqlite/worker/sessions/BusinessSessionManager";
import { BusinessProvisioner } from "./types";
import { BusinessEventTypes, DomainEvent } from "@business/shared-types";

export class SQLiteBusinessProvisioner
implements BusinessProvisioner {
    constructor(
        private readonly sessions: BusinessSessionManager
    ){}

    async provision(event: DomainEvent): Promise<void> {
        if(event.type !== BusinessEventTypes.BUSINESS_CREATED){
            return;
        }

        await this.sessions.createBusiness(event.actor.businessId)
    }
}