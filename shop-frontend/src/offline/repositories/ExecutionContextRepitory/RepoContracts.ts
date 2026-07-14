import { ApplicationContext } from "@/src/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContextContract";


export interface ExecutionContextRepositoryContract {

    getCurrentContext(): Promise<ApplicationContext>;

}