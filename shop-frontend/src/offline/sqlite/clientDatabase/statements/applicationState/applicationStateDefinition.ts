import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { applicationStateKeys } from "./applicationStateKeys"
import * as SQL from "./sql";

export const ApplicationStateDefinition: StatementDefinition[] = [
    {
        key: applicationStateKeys.currentState,
        sql: SQL.CURRENT_STATE,
    },

    {
        key: applicationStateKeys.currentBusiness,
        sql: SQL.UPDATE_CURRENT_BUSINESS
    },

    {
        key: applicationStateKeys.currentBranch,
        sql: SQL.UPDATE_CURRENT_BRANCH
    },

    {
        key: applicationStateKeys.userLogin,
        sql: SQL.UPDATE_USER_DATA
    },

    {
        key: applicationStateKeys.userLogout,
        sql: SQL.UPDATE_USER_LOGOUT
    },

    {
        key: applicationStateKeys.currentWorkspace,
        sql: SQL.UPDATE_WORKSPACE
    },

    {
        key: applicationStateKeys.savedRoute,
        sql: SQL.SAVED_ROUTE
    },

    {
        key: applicationStateKeys.getLastRoute,
        sql: SQL.GET_LASTROUTE
    }


]