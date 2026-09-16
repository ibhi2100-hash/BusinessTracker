import { StatementDefinition } from "@/src/offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";



export class WorkerStatementRegistry {

    private readonly statements =
        new Map<string, any>();


    constructor(
        private readonly db: any
    ) {}


    initialize(
        definitions: StatementDefinition[]
    ) {


        this.clear();


        for (
            const [
                index,
                definition
            ]
            of definitions.entries()
        ) {

            const statementNumber =
                index + 1;



            if (
                this.statements.has(
                    definition.key
                )
            ) {

                const error =
                    new Error(
                        `Duplicate SQLite statement: ${definition.key}`
                    );

                throw error;
            }


            try {

                const stmt =
                    this.db.prepare(
                        definition.sql
                    );


                this.statements.set(
                    definition.key,
                    stmt
                );


            } catch (error) {

                throw error;
            }

        }
    }


    get(key: string) {


        const stmt =
            this.statements.get(key);


        if (!stmt) {

            const error =
                new Error(
                    `SQLite statement not found: ${key}`
                );


            throw error;
        }

        return stmt;
    }


    has(
        key: string
    ): boolean {

        const result =
            this.statements.has(key)

        return result;
    }


    get size(): number {

        const size =
            this.statements.size;

        return size;
    }


    clear() {

        for (
            const [
                key,
                stmt
            ]
            of this.statements.entries()
        ) {

            try {

                stmt.finalize();


            } catch (error) {
                throw new Error(error)

            }
        }


        this.statements.clear();
    }
}