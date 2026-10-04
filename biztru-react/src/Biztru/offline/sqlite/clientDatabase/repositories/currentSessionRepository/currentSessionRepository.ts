import type {
    SQLiteStatementOperation
} from "../../../../../storage/statement/worker/WorkerProtocol";

import {
    CurrentSessionStatements
} from "../../statements/clientSession/clientSessionStatements";

import {
    currentSessionKeys
} from "../../statements/clientSession/clientSessionKeys";

export interface CurrentSession {
    id: number;
    userId: string;
    createdAt: number;
    lastAuthenticatedAt: number;
    updatedAt: number;
}

export class CurrentSessionRepository {
    private readonly statements: CurrentSessionStatements;

    constructor(
        statements: CurrentSessionStatements
    ) {
        this.statements = statements;
    }

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

    async save(
        session: CurrentSession
    ): Promise<void> {
        await this.statements.upsert.execute(
            CurrentSessionMapper.toUpsertRow(session)
        );
    }

    async find(): Promise<CurrentSession> {
        const rows =
            await this.statements.find.query<CurrentSession>();

        return rows[0];
    }

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