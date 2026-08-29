import { RepositoryRegistry } from "../repositories/RepositoryRegistry.js";

export class OfflineSyncService {

    constructor(
       private readonly repositories: RepositoryRegistry
    ) {}

    async push(
        events: any[],
    ): Promise<any> {

        // ...
    }
}