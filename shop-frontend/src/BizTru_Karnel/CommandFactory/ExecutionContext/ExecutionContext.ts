import { ExecutionContextProviderContract } from "./ExecutionContextContract";
import { ExecutionContext } from "../../KarnelTypes/types";
import { ExecutionContextRepositoryContract } from "@/src/offline/sqlite/clientDatabase/repositories/ExecutionContextRepitory/RepoContracts";


export class ExecutionContextProvider
 implements ExecutionContextProviderContract {
    
    private currentContext?: ExecutionContext;
    constructor(
        private readonly executionRepository:
        ExecutionContextRepositoryContract
    ){}
     async initialize() {

        this.currentContext = 
            await this.executionRepository.getCurrentContext()
        console.log("this is the context required in the factory: ", this.currentContext)
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