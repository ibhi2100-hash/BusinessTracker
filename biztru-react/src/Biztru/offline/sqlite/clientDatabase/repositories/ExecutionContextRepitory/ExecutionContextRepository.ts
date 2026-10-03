
import type { ExecutionContextRepositoryContract } from "./RepoContracts";
import { ExecutionContextStatements } from "./ExecutionPreparedStatements";
import type{ ExecutionContext } from "../../../../../BizTru_Karnel/KarnelTypes/types";
export class ExecutionContextRepository 
implements ExecutionContextRepositoryContract {
    private readonly statements: ExecutionContextStatements;
    constructor(
        statements: ExecutionContextStatements
    ) {
        this.statements = statements;
    }

    async getCurrentContext(): Promise<ExecutionContext> {
            
    const rows = 
        await this.statements.current.query<ExecutionContext>();
        const row  = rows[0]
    
     return {

            actorId:
                row?.actorId ?? null,

            email:
                row?.email ?? null,

            role:
                row?.role ?? null,

            sessionId:
                row?.sessionId ?? null,

            deviceId:
                row?.deviceId ?? "",

            businessId:
                row?.businessId ?? null,

            branchId:
                row?.branchId ?? null,

        };
    
}
   
}