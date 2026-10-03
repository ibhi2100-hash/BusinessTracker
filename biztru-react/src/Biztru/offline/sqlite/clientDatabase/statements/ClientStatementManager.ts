import { QueryRunner } from "../../../../storage/queryRunner/QueryRunner"; 
import type{ PreparedStatement } from "../../PreparedStatement/PreparedStatementContract";
import type{ StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import type{ PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
export class ClientPreparedStatementManager 
implements PreparedStatementManager {

    private readonly cache =
        new Map<string, PreparedStatement>();
    private readonly queryRunner: QueryRunner;
    constructor(
        queryRunner: QueryRunner

    ) {
        this.queryRunner = queryRunner;
    }

   get(
        key: string
    ): PreparedStatement{

        let stmt =
            this.cache.get(key);

        if(!stmt){

            throw new Error(
                `Statement '${key}' was not initialized.`
            );

        }

        return stmt;

    }

    initialize(
        defs: StatementDefinition[]
    ){

        for(const def of defs){
            if(this.cache.has(def.key)){
                continue
            }
            const stmt =
                this.queryRunner.prepare(
                    def
                );

            this.cache.set(
                def.key,
                stmt
            );

        }

    }
    clear() {

        for (const stmt of this.cache.values()) {

            stmt.dispose();

        }

        this.cache.clear();

    }

}