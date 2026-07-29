import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";
import * as SQL from "./sql";

export const EventDefinitions: StatementDefinition[] = [

    {
        key: "events.insert",
        sql: SQL.INSERT_EVENT
    },

    {
        key: "events.loadAggregate",
        sql: SQL.LOAD_AGGREGATE
    },

    {
        key: "events.loadEvent",
        sql: SQL.LOAD_EVENT
    },

    {
        key: "events.exists",
        sql: SQL.EXISTS
    },

    {
        key: "events.loadSince",
        sql: SQL.LOAD_SINCE
    },

    {
        key: "events.delete",
        sql: SQL.DELETE_EVENT
    },

    {
        key: "events.count",
        sql: SQL.COUNT_EVENTS
    },

    {
        key: "events.lastPosition",
        sql: SQL.LAST_POSITION
    }

];