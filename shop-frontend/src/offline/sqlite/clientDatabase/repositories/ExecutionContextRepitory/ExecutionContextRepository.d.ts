import { StorageBus } from "../../sqlite/bus/StorageBus";
import { ExecutionContextRepositoryContract } from "./RepoContracts";
export declare class ExecutionContextRepository implements ExecutionContextRepositoryContract {
    private readonly storage;
    private static instance;
    constructor(storage: StorageBus);
    getCurrentContext(): Promise<any>;
}
