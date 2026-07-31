import { Lifecycle } from "@/src/offline/sqlite/lifecycle/LifeCycle";
import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";
import { SQLiteRuntimeOptions } from "./SQLiteRuntimOptions";

export class SQLiteRuntime
implements Lifecycle {
 
    private promiser: any;

    private dbId: string;

    private worker?: Worker
  
    private initialized = false;
    constructor(
        private readonly options: SQLiteRuntimeOptions
    ){}

    get connection(){
        return this.promiser;
    }
    async initialize(){
        if(this.initialized){
            return;
        }
            this.worker =
            new Worker(
                "/sqlite/sqlite3-worker1.mjs",
                {
                    type: "module"
                }
            );

            const worker = this.worker

        this.promiser = await new Promise((resolve) => {

            const promiser = sqlite3Worker1Promiser({

                worker,

                onready(){
                    resolve(promiser);
                }

            });

        });

        const result = await this.promiser(
                "open",
                {
                    filename: 
                        this.options.filename,
                    
                    vfs: this.options.vfs ?? "opfs"
                }
        )

        this.dbId = result.dbId
        this.initialized = true
    }
    async start(): Promise<void> {
        if(!this.initialized){
            await this.initialize()
        }
    }
    
    async stop(): Promise<void> {
        
        if (!this.initialized)
            return;

        await this.promiser("close", {});

        this.initialized = false;

    }

    async dispose(): Promise<void> {
        await this.stop;

        this.worker?.terminate();
        
        this.worker = undefined;

        this.promiser = undefined
    }
}


   
        
    
