import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { EventStatmentKeys } from "./Keys";
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
            manager.get(
                EventStatmentKeys.insert
            );

        this.loadAggregate =
            manager.get(
                EventStatmentKeys.loadAggregates
            );

        this.loadEvent =
            manager.get(
               EventStatmentKeys.loadEvent
            );

        this.exists =
            manager.get(
                EventStatmentKeys.exist
            );

        this.loadSince =
            manager.get(
                EventStatmentKeys.loadSince
            );

        this.count =
            manager.get(
                EventStatmentKeys.eventCount
            );

    }

}