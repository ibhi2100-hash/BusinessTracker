import { ExecutionContext } from "../../../BizTru_Karnel/CommandFactory/ExecutionContext";  

export interface ExecutionContextRepositoryContract {

    getCurrentContext(): Promise<ExecutionContext>;

}