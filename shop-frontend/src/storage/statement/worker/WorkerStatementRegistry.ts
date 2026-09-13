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
            const definition
            of definitions
        ) {

            if (
                this.statements.has(
                    definition.key
                )
            ) {
                throw new Error(
                    `Duplicate SQLite statement: ${definition.key}`
                );
            }

            const stmt =
                this.db.prepare(
                    definition.sql
                );

            this.statements.set(
                definition.key,
                stmt
            );
        }
    }

    get(key: string) {

        const stmt =
            this.statements.get(key);

        if (!stmt) {
            throw new Error(
                `SQLite statement not found: ${key}`
            );
        }

        return stmt;
    }

    has(
        key: string
    ): boolean {
        return this.statements.has(key);
    }

    get size(): number {
        return this.statements.size
    }

    clear() {

        for (
            const stmt
            of this.statements.values()
        ) {

            try {
                stmt.finalize();
            } catch {
                
            }
        }

        this.statements.clear();
    }
}