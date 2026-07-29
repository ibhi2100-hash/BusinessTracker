import { StatementRegistry } from "@/src/offline/sqlite/businessDatabase/statements/StatementRegistry";
import { QueryRunner } from "../queryRunner/QueryRunner";
import { SQLiteRuntime } from "../runtime/SQLiteRuntime";

export class StatementManager {
    constructor(
        private queryRunner: QueryRunner
    ){}

    prepare(key: string, sql:string){

        const native =
            this.queryRunner.prepare(
                key,
                sql
            )

        return new SQLiteStatement(native);

    }

    async initialize(){
        const statementRegistry: = new StatementRegistry()
    }
}