import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { EventStatementKeys } from "./Keys";
import * as SQL from "./sql";

export const EventStatementsDefinition: StatementDefinition[] = [

    {
        key: EventStatementKeys.insert,
        sql: SQL.INSERT_EVENT
    },

    {
        key: EventStatementKeys.loadAggregates,
        sql: SQL.LOAD_AGGREGATE
    },

    {
        key: EventStatementKeys.loadEvent,
        sql: SQL.LOAD_EVENT
    },

    {
        key: EventStatementKeys.exist,
        sql: SQL.EXISTS
    },

    {
        key: EventStatementKeys.loadSince,
        sql: SQL.LOAD_SINCE
    },

    {
        key: EventStatementKeys.eventCount,
        sql: SQL.COUNT_EVENTS
    },

    {
        key: EventStatementKeys.eventLastposition,
        sql: SQL.LAST_POSITION
    },

    {
        key: EventStatementKeys.loadProjectionEvent,
        sql: SQL.LOAD_PROJECTION_EVENT
    },
    
    {
        key: EventStatementKeys.loadAggregates,
        sql: SQL.LOAD_AGGREGATE
    },

    {
        key: EventStatementKeys.loadAll,
        sql: SQL.LOADALL
    },

    {
        key: EventStatementKeys.eventStream,
        sql: SQL.STREAM_EVENTS
    }

];