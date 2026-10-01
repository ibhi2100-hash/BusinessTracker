import type{ ExecutionContext } from "../../../../../BizTru_Karnel/KarnelTypes/types"; 
export interface ExecutionContextRepositoryContract {

    getCurrentContext(): Promise<ExecutionContext>;

}