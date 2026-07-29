import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";

export class SQLiteRuntime {
    private sqlite: any;
    private promiser: any;
    private dbId: string;

    private initialized = false;
    get connection(){
        return this.promiser;
    }
    async initialize(){
        if(this.initialized){
            return;
        }
        const sqliteWorker =
            new Worker(
                "/sqlite/sqlite3-worker1.mjs",
                {
                    type: "module"
                }
            );

        this.promiser = await new Promise<any>((resolve) => {

            const promiser = sqlite3Worker1Promiser({

                worker: sqliteWorker,

                onready: () => {
                    resolve(promiser);
                }

            });

        });

        const result = await this.promiser(
                "open",
                {
                    filename: "/client.db",
                    
                    vfs: "opfs"
                }
        )

        this.dbId = result.dbId
        this.initialized = true
    }
    async open() {

    }

    async close() {

        if (!this.initialized)
            return;

        await this.promiser("close", {});

        this.initialized = false;

    }
    
}