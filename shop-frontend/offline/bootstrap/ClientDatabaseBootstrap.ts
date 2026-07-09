// components/AppBootstrap.tsx

import { StorageBus } from "@/src/offline/sqlite/bus/StorageBus";

export class ClientDatabaseBootstrap {
    constructor(
        private readonly storage: StorageBus
    ){}

    async initialize(): Promise<void>{
        await this.storage.openClient();
    }
}