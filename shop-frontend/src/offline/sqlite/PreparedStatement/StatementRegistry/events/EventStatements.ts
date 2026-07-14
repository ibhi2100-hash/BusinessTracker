import { PreparedStatement } from "../../engine/PreparedStatement";
import { PreparedStatementManager } from "../../engine/PreparedStatementManager";

import * as SQL from "./sql";

export class EventStatements {

    readonly insert: PreparedStatement;

    readonly loadAggregate: PreparedStatement;

    readonly loadEvent: PreparedStatement;

    readonly exists: PreparedStatement;

    readonly loadSince: PreparedStatement;

    readonly deleteEvent: PreparedStatement;

    readonly count: PreparedStatement;

    readonly lastPosition: PreparedStatement;

    constructor(
        manager: PreparedStatementManager
    ) {

        this.insert =
            manager.statement(
                "events.insert",
                SQL.INSERT_EVENT
            );

        this.loadAggregate =
            manager.statement(
                "events.loadAggregate",
                SQL.LOAD_AGGREGATE
            );

        this.loadEvent =
            manager.statement(
                "events.loadEvent",
                SQL.LOAD_EVENT
            );

        this.exists =
            manager.statement(
                "events.exists",
                SQL.EXISTS
            );

        this.loadSince =
            manager.statement(
                "events.loadSince",
                SQL.LOAD_SINCE
            );

        this.deleteEvent =
            manager.statement(
                "events.delete",
                SQL.DELETE_EVENT
            );

        this.count =
            manager.statement(
                "events.count",
                SQL.COUNT_EVENTS
            );

        this.lastPosition =
            manager.statement(
                "events.lastPosition",
                SQL.LAST_POSITION
            );

    }

}