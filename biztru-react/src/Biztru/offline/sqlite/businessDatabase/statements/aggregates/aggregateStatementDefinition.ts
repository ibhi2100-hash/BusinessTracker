import type{ StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { aggregateStatementsKeys } from "./aggregateStatementsKeys";
import * as SQL from "./sql";

// AggregateStatementDefinition.ts

export const AggregateStatementDefinition: StatementDefinition[] = [
    {
        key: aggregateStatementsKeys.insert,
        sql: SQL.INSERX_INTO_AGGREGATES,
    },
    {
        key: aggregateStatementsKeys.getAggregate,
        sql: SQL.GET_AGGREGATE,
    },
    {
        key: aggregateStatementsKeys.getVersion,
        sql: SQL.GET_VERSION,
    },
    {
        key: aggregateStatementsKeys.getAllAggregates,
        sql: SQL.GET_ALL_AGGREGATES,
    },
    {
        key: aggregateStatementsKeys.advanceLocal,
        sql: SQL.ADVANCE_LOCAL_VERSION,
    },
    {
        key: aggregateStatementsKeys.advanceRemote,
        sql: SQL.ADVANCE_REMOTE_VERSION,
    },
];