
import { BusinessStatementRegistry } from "../statements/StatementRegistry";
import { SQLiteEventRepository } from "./SQLiteEventRepository/eventStore";
import { SQLiteLedgerRepository } from "./SQLiteLedgerRepository/SQLiteLedgerRepository";
import { SQLiteBranchRepository } from "./SQLiteProjectionRepository/SQLiteBranchRepository";
import { SQLiteBusinessRepository } from "./SQLiteProjectionRepository/SQLiteBusinessRepository";
import { LogicClockRepository } from "./LogicClockRepository/LogicClockRepository";

export class BusinessRepositoryRegistry {
    readonly events: SQLiteEventRepository;


    readonly ledger: SQLiteLedgerRepository;

    readonly business: SQLiteBusinessRepository;

    readonly branches: SQLiteBranchRepository;

    readonly logicClock: LogicClockRepository;

    constructor(
        statements: BusinessStatementRegistry
    ){
        this.events =
            new SQLiteEventRepository(
                statements.events
            )

        this.business = 
            new SQLiteBusinessRepository(
                statements.business
            );

        this.logicClock = 
            new LogicClockRepository(
                statements.logicClock
            )


    }
}