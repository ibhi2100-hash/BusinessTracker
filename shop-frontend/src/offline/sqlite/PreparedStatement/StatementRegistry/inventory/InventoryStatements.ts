import { PreparedStatementManager } from "../../PreparedStatementManager";
import { EventStatements } from "@/src/offline/repositories/SQLiteEventRepository/EventStatements";
// import { SnapshotStatements } from "./snapshot/SnapshotStatements";
// import { LedgerStatements } from "./ledger/LedgerStatements";
// import { ProjectionStatements } from "./projection/ProjectionStatements";

export class StatementRegistry {

    readonly events: EventStatements;

    // readonly snapshots: SnapshotStatements;
    // readonly ledger: LedgerStatements;
    // readonly projections: ProjectionStatements;

    constructor(
        manager: PreparedStatementManager
    ) {

        this.events =
            new EventStatements(manager);

        // this.snapshots =
        //     new SnapshotStatements(manager);

        // this.ledger =
        //     new LedgerStatements(manager);

        // this.projections =
        //     new ProjectionStatements(manager);

    }

}