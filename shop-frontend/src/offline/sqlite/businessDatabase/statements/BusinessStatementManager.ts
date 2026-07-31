import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { PreparedStatement } from "../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
import { StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";

export class BusinessPreparedStatementManager
implements PreparedStatementManager {

    private readonly cache =
        new Map<string, PreparedStatement>()

        constructor(
            private readonly querryRunner: QueryRunner
        ){}

        get(key: string): PreparedStatement {
            let stmt = 
                this.cache.get(key);

            if(!stmt){
                throw new Error(
                    `Statement '${key}' was not initialized.`
                );
            }

            return stmt
        }

        initialize(defs: StatementDefinition[]): void {
            for(const def of defs){
                if(this.cache.has(def.key)){
                    continue
                }

                const stmt =
                    this.querryRunner.prepare(
                        def
                    );

                    this.cache.set(
                        def.key,
                        stmt
                    );
            }
        }

        clear(): void {
            for(const stmt of this.cache.values()){
                stmt.dispose
            }

            this.cache.clear()
        }
}