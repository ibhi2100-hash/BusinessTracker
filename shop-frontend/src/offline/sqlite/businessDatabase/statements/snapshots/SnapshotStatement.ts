import { PreparedStatement } from "../../engine/PreparedStatement";
import { PreparedStatementManager } from "../../engine/PreparedStatementManager";

export class SnapshotStatements {

    readonly insert: PreparedStatement;

    readonly loadLatest: PreparedStatement;

    readonly deleteSnapshots: PreparedStatement;

    constructor(
        manager: PreparedStatementManager
    ) {

        this.insert =
            manager.statement(
                "snapshots.insert",
                `
INSERT INTO snapshots(
    aggregateId,
    aggregateType,
    version,
    state,
    createdAt
)
VALUES (?, ?, ?, ?, ?)
`
            );

        this.loadLatest =
            manager.statement(
                "snapshots.loadLatest",
                `
SELECT *
FROM snapshots
WHERE aggregateId = ?
ORDER BY version DESC
LIMIT 1
`
            );

        this.deleteSnapshots =
            manager.statement(
                "snapshots.delete",
                `
DELETE
FROM snapshots
WHERE aggregateId = ?
`
            );

    }

}