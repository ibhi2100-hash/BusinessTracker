import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import { EventStatmentKeys } from "./Keys";
import * as SQL from "./sql";

export const EventStatementsDefinition: StatementDefinition[] = [

    {
        key: EventStatmentKeys.insert,
        sql: SQL.INSERT_EVENT
    },

    {
        key: EventStatmentKeys.loadAggregates,
        sql: SQL.LOAD_AGGREGATE
    },

    {
        key: EventStatmentKeys.loadEvent,
        sql: SQL.LOAD_EVENT
    },

    {
        key: EventStatmentKeys.exist,
        sql: SQL.EXISTS
    },

    {
        key: EventStatmentKeys.loadSince,
        sql: SQL.LOAD_SINCE
    },

    {
        key: EventStatmentKeys.eventCount,
        sql: SQL.COUNT_EVENTS
    },

    {
        key: EventStatmentKeys.eventLastposition,
        sql: SQL.LAST_POSITION
    }

];