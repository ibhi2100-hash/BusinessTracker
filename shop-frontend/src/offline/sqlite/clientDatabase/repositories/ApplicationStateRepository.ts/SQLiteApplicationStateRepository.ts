import { ApplicationStateRepository } from "./ApplicationStateContract";
import { ApplicationState } from "./ApplicationState";
import { ApplicationStateStatements } from "../../statements/applicationState/applicationStateStatements";
import type { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";

interface LastRoute {
    lastRoute: string;
}

export class SQLiteApplicationStateRepository
implements ApplicationStateRepository {

    constructor(
        private readonly statements: ApplicationStateStatements
    ) {}

    // ============================================================
    // READ
    // ============================================================

    async current(): Promise<ApplicationState> {
        const rows =
            await this.statements.current.query<ApplicationState>();

        return rows[0];
    }

    // ============================================================
    // LIVE / IMMEDIATE OPERATIONS
    // ============================================================

    async setCurrentBusiness(
        businessId: string
    ): Promise<void> {
        await this.statements
            .setCurrentBusiness
            .execute([businessId]);
    }

    async setCurrentBranch(
        branchId: string | null
    ): Promise<void> {
        await this.statements
            .setCurrentBranch
            .execute([branchId]);
    }

    async setCurrentUser(
        userId: string,
        sessionId: string
    ): Promise<void> {
        await this.statements
            .setCurrentUser
            .execute([
                userId,
                sessionId
            ]);
    }

    async setLastRoute(
        route: string
    ): Promise<void> {
        await this.statements
            .savedRoute
            .execute([route]);
    }

    async getLastRoute(): Promise<LastRoute> {
        const rows =
            await this.statements
                .getLastRoute
                .query<LastRoute>();

        return rows[0];
    }

    async clearSession(): Promise<void> {
        await this.statements
            .clearSession
            .execute();
    }

    // ============================================================
    // TRANSACTION / PROJECTION OPERATIONS
    // ============================================================

    setCurrentBusinessOperation(
        businessId: string
    ): SQLiteStatementOperation {
        return {
            statementKey: this.statements.setCurrentBusiness.key,
            params: [businessId],
        };
    }

    setCurrentBranchOperation(
        branchId: string | null
    ): SQLiteStatementOperation {
        return {
            statementKey: this.statements.setCurrentBranch.key,
            params: [branchId],
        };
    }

    setCurrentUserOperation(
        userId: string,
        sessionId: string
    ): SQLiteStatementOperation {
        return {
            statementKey: this.statements.setCurrentUser.key,
            params: [
                userId,
                sessionId,
            ],
        };
    }

    setLastRouteOperation(
        route: string
    ): SQLiteStatementOperation {
        return {
            statementKey: this.statements.savedRoute.key,
            params: [route],
        };
    }

    clearSessionOperation(): SQLiteStatementOperation {
        return {
            statementKey: this.statements.clearSession.key,
            params: [],
        };
    }
}