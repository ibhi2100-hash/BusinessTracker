import type{ DomainEvent } from "@business/shared-types";
import { BusinessManager } from "./BusinessManager";

export class BusinessProvisioner {
    private readonly businessManager: BusinessManager;
    constructor(
        businessManager: BusinessManager
    ){
        this.businessManager = businessManager
    }

    async provision(event: DomainEvent) {
        return this.businessManager.bootstrap(
            event.aggregateId
        )
    }
}