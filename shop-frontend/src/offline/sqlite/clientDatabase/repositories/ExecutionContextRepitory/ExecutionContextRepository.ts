import { StorageBus } from "../../../bus/StorageBus";
import { StorageBusCreator } from "../../../bus/StorageBusCreator";
import { DatabaseTarget } from "../../../protocol/DatabaseTarget";
import { ExecutionContextRepositoryContract } from "./RepoContracts";

export class ExecutionContextRepository implements ExecutionContextRepositoryContract {
    private static instance: ExecutionContextRepository
    
    constructor(
        private readonly storage: StorageBus
    ){}

    async getCurrentContext(): Promise<any> {
            // Implement the logic to retrieve the current execution context
            const sql = `
                SELECT

                        u.id            AS actorId,
                        u.email         AS email,
                        u.role          AS role,

                        s.id            AS sessionId,

                        d.deviceId            AS deviceId,

                        n.businessId    AS businessId,

                        ab.branchId     AS branchId,

                        lc.currentClock AS logicalClock

                    FROM users u

                    CROSS JOIN sessions s

                    CROSS JOIN device d

                    LEFT JOIN known_nodes n ON TRUE

                    LEFT JOIN active_branch ab ON TRUE

                    LEFT JOIN logic_clock lc ON TRUE

                    LIMIT 1;
                            `


        const rows =await this.storage.query(
            DatabaseTarget.CLIENT,
            sql,
        )
        console.log("This is the record i gets from client database", rows)
        const record = rows[0] as any;

        if (!record) {
        throw new Error(
            "Execution context not found."
        );
    }

    return {
    actorId: record.actorId,
    email: record.email,
    role: record.role,

    sessionId: record.sessionId,
    deviceId: record.deviceId,

    businessId: record.businessId ?? undefined,
    branchId: record.branchId ?? undefined,

    logicalClock: record.logicalClock ?? 0,
};
}
   
}