import { SyncEngine } from "../engine/SyncEngine";

export class SyncManager {

    private syncing = false;

    constructor(
        private engine: SyncEngine
    ) {}

    async sync() {

        if (this.syncing)
            return;

        this.syncing = true;

        try {

            await this.engine.sync();

        } finally {

            this.syncing = false;

        }

    }

}