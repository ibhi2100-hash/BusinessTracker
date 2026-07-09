import { StorageBus } from "../../sqlite/bus/StorageBus";
import { StorageBusCreator } from "../../sqlite/bus/StorageBusCreator";
import { DatabaseTarget } from "../../sqlite/protocol/DatabaseTarget";
import { ExecutionContextRepositoryContract } from "./RepoContracts";
import { ExecutionContextRecord } from "./RepoContracts";
export class ExecutionContextRepository implements ExecutionContextRepositoryContract {
    constructor(
        private readonly storage: StorageBus
    ){}
    async getCurrentContext(): Promise<ExecutionContextRecord> {
            // Implement the logic to retrieve the current execution context
            const sql = `
                SELECT

                        u.id            AS actorId,
                        u.email         AS email,
                        u.role          AS role,

                        s.id            AS sessionId,

                        d.id            AS deviceId,

                        n.businessId    AS businessId,

                        ab.branchId     AS branchId,

                        lc.currentClock AS logicalClock

                    FROM user u

                    CROSS JOIN session s

                    CROSS JOIN device d

                    CROSS JOIN known_nodes n

                    CROSS JOIN active_branch ab

                    CROSS JOIN logic_clock lc

                    LIMIT 1;
                            `


            const record =
        await this.storage.scalar<ExecutionContextRecord>(
            DatabaseTarget.CLIENT,
            sql
        );

        if (!record) {
        throw new Error(
            "Execution context not found."
        );
    }

    return record;
}
   
}