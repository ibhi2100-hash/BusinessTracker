import { ExecutionContext, ExecutionContextProviderContract } from "./ExecutionContextContract";
import { ExecutionContextRepository } from "@/src/offline/repositories/ExecutionContextRepitory/ExecutionContextRepository";

export class ExecutionContextProvider implements ExecutionContextProviderContract {
    constructor(
        private readonly repo: ExecutionContextRepository
    ){}
    async current(): Promise<ExecutionContext> {
       const context = await this.repo.getCurrentContext() ;

       return context
    }
}