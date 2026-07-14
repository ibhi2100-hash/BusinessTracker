import { PreparedStatement } from "../../engine/PreparedStatement";
import { PreparedStatementManager } from "../../engine/PreparedStatementManager";

export class AggregateVersionStatements {

    readonly load: PreparedStatement;

    readonly upsert: PreparedStatement;

    constructor(
        manager: PreparedStatementManager
    ) {

        this.load =
            manager.statement(
                "aggregateVersion.load",
                `
SELECT version
FROM aggregate_versions
WHERE aggregateId = ?
`
            );

        this.upsert =
            manager.statement(
                "aggregateVersion.upsert",
                `
INSERT INTO aggregate_versions(
    aggregateId,
    version
)
VALUES(?, ?)
ON CONFLICT(aggregateId)
DO UPDATE SET
version = excluded.version
`
            );

    }

}