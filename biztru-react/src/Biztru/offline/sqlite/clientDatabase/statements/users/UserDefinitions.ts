import type {
    StatementDefinition
} from "../../../PreparedStatement/StatementRegistry/statementDefinition";

import * as SQL from "./sql";

import {
    UserStatementKeys as Keys
} from "./keys";


export const UserDefinitions: StatementDefinition[] = [

    {
        key: Keys.insert,
        sql: SQL.INSERT_USER
    },

    {
        key: Keys.findById,
        sql: SQL.FIND_BY_ID
    },

    {
        key: Keys.update,
        sql: SQL.UPDATE_USER
    },

    {
        key: Keys.updateBusiness,
        sql: SQL.UPDATE_USER_BUSINESS
    },

    {
        key: Keys.updateBranch,
        sql: SQL.UPDATE_USER_BRANCH
    },

    {
        key: Keys.updateActivation,
        sql: SQL.UPDATE_USER_ACTIVATION
    },

    {
        key: Keys.updateOnboarding,
        sql: SQL.UPDATE_USER_ONBOARDING
    },

    {
        key: Keys.updateProfile,
        sql: SQL.UPDATE_USER_PROFILE
    },

    {
        key: Keys.delete,
        sql: SQL.DELETE_USER
    }

];