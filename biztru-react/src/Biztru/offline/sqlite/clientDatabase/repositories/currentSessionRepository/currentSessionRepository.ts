import type {
    SQLiteStatementOperation
} from "../../../../../storage/statement/worker/WorkerProtocol";

import {
    CurrentSessionStatements
} from "../../statements/clientSession/clientSessionStatements"

import {
    currentSessionKeys
} from "../../statements/clientSession/clientSessionKeys"

export interface CurrentSession {
    id: number;
    userId: string;
    createdAt: number;
    lastAuthenticatedAt: number;
    updatedAt: number | null;
}

export class CurrentSessionRepository {
    private readonly statements: CurrentSessionStatements;
    constructor(
        statements: CurrentSessionStatements
    ) {
        this.statements = statements;
    }

    /**
     * Build the database operation without executing it.
     */
    upsertOperation(
        session: CurrentSession
    ): SQLiteStatementOperation {
        return {
            statementKey:
                currentSessionKeys.upsertCurrentSession,

            params:
                CurrentSessionMapper.toUpsertRow(session),
        };
    }

    /**
     * Immediately save the current session.
     */
    async save(
        session: CurrentSession
    ): Promise<void> {
        await this.statements.upsert.execute(
            CurrentSessionMapper.toUpsertRow(session)
        );
    }

    /**
     * Load the current client session.
     */
    async find(): Promise<CurrentSession | undefined> {
        const rows =
            await this.statements.find.query<CurrentSession>();

        return rows[0];
    }

    /**
     * Remove the current session.
     */
    async clear(): Promise<void> {
        await this.statements.delete.execute([]);
    }
}

class CurrentSessionMapper {

    static toUpsertRow(
        session: CurrentSession
    ): readonly unknown[] {
        return [
            session.id,
            session.userId,
            session.createdAt,
            session.lastAuthenticatedAt,
            session.updatedAt,
        ];
    }
}