import { BusinessPreparedStatementManager } from "@/src/offline/sqlite/businessDatabase/statements/PreparedStatementManager";
import { QueryRunner } from "../queryRunner/QueryRunner";
import { TransactionManager } from "../transaction/TransactionManager";
import { SQLiteRuntime } from "./SQLiteRuntime";
import { Lifecycle } from "@/src/offline/sqlite/lifecycle/LifeCycle";

export class BusinessRuntime
implements Lifecycle {
    private state: RuntimeState
    readonly queryRunner: QueryRunner;
    readonly transactionManager: TransactionManager

    constructor(
        readonly businessId: string,

        readonly sqlite: SQLiteRuntime,

        queryRunner: QueryRunner,

        transactionManager: TransactionManager,
    ){
        this.queryRunner = queryRunner;

        this.transactionManager = transactionManager
    };
    
    async initialize(){
        if(this.state !== RuntimeState.Created){
            return
        }
        await this.sqlite.initialize();
    }
   
    async start(): Promise<void> {
        await this.sqlite.start()
    }

    async stop(): Promise<void> {
        await this.sqlite.stop()
    }

    async dispose(): Promise<void> {
        await this.sqlite.dispose

    }

}
