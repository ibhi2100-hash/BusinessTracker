import type{ Session, SessionRepositoryContract } from "./SessionInterface";
import { SessionStatements } from "../../statements/session/SessionStatements";

export class SQLiteSessionRepository implements SessionRepositoryContract {
    private readonly statements: SessionStatements;
    constructor(
        sessionStatement: SessionStatements
    ) {
        this.statements = sessionStatement;
    }

    async saveSession(sessionData: Session){
        console.log("This is the Session Data that is being saved: ", sessionData)
        await this.statements.saveSession.execute(
            SessionMapper.toInsert(sessionData)
        )
    }

    async getCurrentSession(): Promise<Session> {
        const rows = await this.statements.getCurrentSession.query<Session>()

        return rows[0]
    }
    async clearSession(): Promise<void> {
        await this.statements.clearSession.execute()
    }
}
export class SessionMapper {
    static toInsert(
        session: Session
    ): readonly unknown[]{
        return [
            session.id,
            session.userId,
            session.accessToken,
            session.refreshToken,
            session.expiresAt,
            session.createdAt
        ]
    }
}