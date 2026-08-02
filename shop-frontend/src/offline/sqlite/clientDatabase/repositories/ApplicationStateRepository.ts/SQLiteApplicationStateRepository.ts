import { ApplicationStateRepository } from "./ApplicationStateContract";
import { ApplicationState } from "./ApplicationState";
import { ApplicationStateStatements }  from "../../statements/applicationState/applicationStateStatements";


export class SQLiteApplicationStateRepository
implements ApplicationStateRepository {

    constructor(
        private readonly statements: ApplicationStateStatements
    ) {}

    async current(): Promise<ApplicationState> {
        const rows =
            await this.statements.current.query<ApplicationState>();
        console.log("this the Business State Rows i get from Backend: ", rows)

        return rows[0];
    }

    async setCurrentBusiness(
        businessId: string
    ) {
        await this.statements
            .setCurrentBusiness
            .execute([businessId])
    }

    async setCurrentBranch(
        branchId: string | null
    ) {
        await this.statements
            .setCurrentBranch
            .execute([branchId]);
    }

    async setCurrentUser(
        userId: string,
        sessionId: string
    ) {
        await this.statements
            .setCurrentUser
            .execute([
                userId,
                sessionId
            ]);
    }

    async clearSession() {
        await this.statements
            .clearSession
            .execute();
    }
}