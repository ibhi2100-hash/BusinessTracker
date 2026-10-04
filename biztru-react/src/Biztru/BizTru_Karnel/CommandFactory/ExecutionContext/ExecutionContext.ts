import type{ ExecutionContextProviderContract } from "./ExecutionContextContract";
import type{ ExecutionContext } from "../../KarnelTypes/types";
import type { ExecutionContextRepositoryContract } from "../../../offline/sqlite/clientDatabase/repositories/ExecutionContextRepitory/RepoContracts"; 


export class ExecutionContextProvider
 implements ExecutionContextProviderContract {
    
    private currentContext?: ExecutionContext;

    private readonly executionRepository: ExecutionContextRepositoryContract
    constructor(
        executionRepository:
        ExecutionContextRepositoryContract
    ){
        this.executionRepository = executionRepository
    }
     async initialize() {

        this.currentContext = 
            await this.executionRepository.getCurrentContext()
    }

   current(): ExecutionContext {

        if (!this.currentContext) {
            throw new Error(
                "ExecutionContextProvider has not been initialized."
            );
        }
        return this.currentContext;
    }

    async refresh(): Promise<void>{
        this.currentContext = await this.executionRepository.getCurrentContext()
    }
}