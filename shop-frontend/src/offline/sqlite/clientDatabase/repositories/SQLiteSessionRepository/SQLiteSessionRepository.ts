import { Session, SessionRepositoryContract } from "./SessionInterface";
import { SessionStatements } from "./SessionStatements";

export class SQLiteSessionRepository implements SessionRepositoryContract {
    constructor(
        private authSession: SessionStatements
    ){}

    async saveSession(sessionData: Session){
        await this.authSession.saveSession(sessionData)
    }

    async getCurrentSession(): Promise<Session> {
        const sessionUser = await this.authSession.getCurrentSession();

        return sessionUser
    }

    async clearSession(): Promise<void> {
        await this.authSession.clearSession()
    }
}