import type { StatementDefinition } from "../../../offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";

export class WorkerStatementRegistry {

    private readonly statements =
        new Map<string, any>();

    private readonly db: any;
    constructor(
        db: any
    ) {
        this.db = db
    }


    initialize(
    definitions: StatementDefinition[]
) {
    this.clear();

    for (const definition of definitions) {

        if (
            this.statements.has(
                definition.key
            )
        ) {
            throw new Error(
                `Duplicate SQLite statement: ${definition.key}: ${definition.sql}`
            );
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
            
                stmt
            ]
            of this.statements.entries()
        ) {

            try {
                stmt


            } catch (error) {
                throw new Error();

            }
        }


        this.statements.clear();
    }
}