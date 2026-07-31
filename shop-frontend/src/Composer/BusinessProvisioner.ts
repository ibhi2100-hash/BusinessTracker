import { DomainEvent } from "@business/shared-types";
import { BusinessManager } from "./BusinessManager";

export class BusinessProvisioner {
    constructor(
        private readonly businessManager: BusinessManager
    ){}

    async provision(event: DomainEvent) {
        return this.businessManager.bootstrap(
            event.aggregateId
        )
    }
}