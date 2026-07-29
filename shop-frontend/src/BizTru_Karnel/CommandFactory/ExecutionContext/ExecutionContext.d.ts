import { ExecutionContextProviderContract } from "./ExecutionContextContract";
import { ExecutionContextRepository } from "@/src/offline/repositories/ExecutionContextRepitory/ExecutionContextRepository";
import { ExecutionContext } from "../../KarnelTypes/types";
export declare class ExecutionContextProvider implements ExecutionContextProviderContract {
    private readonly repo;
    private currentContext?;
    constructor(repo: ExecutionContextRepository);
    initialize(): Promise<void>;
    current(): ExecutionContext;
    refresh(): Promise<void>;
}
