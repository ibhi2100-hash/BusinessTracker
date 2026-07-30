import { ExecutionContext } from "@/src/BizTru_Karnel/KarnelTypes/types";
export interface ExecutionContextRepositoryContract {

    getCurrentContext(): Promise<ExecutionContext>;

}