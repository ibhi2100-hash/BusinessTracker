import { ExecutionContextProviderContract } from "./ExecutionContextContract";
import { ExecutionContextRepository } from "@/src/offline/sqlite/clientDatabase/repositories/ExecutionContextRepitory/ExecutionContextRepository";
import { ExecutionContext } from "../../KarnelTypes/types";

export class ExecutionContextProvider implements ExecutionContextProviderContract {
    
    private currentContext?: ExecutionContext;
    
    constructor(
        private readonly repo: ExecutionContextRepository
    ){}
     async initialize() {

        this.currentContext =
            await this.repo.getCurrentContext();

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
        this.currentContext = await this.repo.getCurrentContext();
    }
}