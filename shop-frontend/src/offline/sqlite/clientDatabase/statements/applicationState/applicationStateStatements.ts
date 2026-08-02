import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { applicationStateKeys } from "./applicationStateKeys";

export class ApplicationStateStatements {

    readonly initialize: PreparedStatement;

    readonly current: PreparedStatement;

    readonly setCurrentBusiness: PreparedStatement;

    readonly setCurrentBranch: PreparedStatement;

    readonly setCurrentUser: PreparedStatement;

    readonly clearSession: PreparedStatement;

    readonly setWorkspaceVersion: PreparedStatement;

    constructor(
        manager: PreparedStatementManager
    ) {

        this.current =
            manager.get(
                applicationStateKeys.currentState
            );

        this.setCurrentBusiness =
            manager.get(
                applicationStateKeys.currentBusiness
            );

        this.setCurrentBranch =
            manager.get(
                applicationStateKeys.currentBranch
            );

        this.setCurrentUser =
            manager.get(
                applicationStateKeys.userLogin
            );

        this.clearSession =
            manager.get(
                applicationStateKeys.userLogout
            );

        this.setWorkspaceVersion =
            manager.get(
                applicationStateKeys.currentWorkspace
            )

        
    }
}