import { PreparedStatement } from "../../engine/PreparedStatement";
import { PreparedStatementManager } from "../../engine/PreparedStatementManager";

export class ProjectionStatements {

    readonly insert: PreparedStatement;

    readonly replace: PreparedStatement;

    readonly load: PreparedStatement;

    constructor(
        manager: PreparedStatementManager
    ) {

        this.insert =
            manager.statement(
                "projection.insert",
                `
INSERT INTO projections(
    projectionId,
    projectionType,
    payload
)
VALUES (?, ?, ?)
`
            );

        this.replace =
            manager.statement(
                "projection.replace",
                `
INSERT OR REPLACE INTO projections(
    projectionId,
    projectionType,
    payload
)
VALUES (?, ?, ?)
`
            );

        this.load =
            manager.statement(
                "projection.load",
                `
SELECT *
FROM projections
WHERE projectionId = ?
`
            );

    }

}