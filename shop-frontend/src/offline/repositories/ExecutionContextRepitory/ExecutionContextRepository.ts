import { ExecutionContextRepositoryContract } from "./RepoContracts";
import { ExecutionContext } from "../../../BizTru_Karnel/CommandFactory/ExecutionContext";
import { StorageClient } from "../../sqlite/bus/StorageBus";

export class ExecutionContextRepository implements ExecutionContextRepositoryContract {
    getCurrentContext(): Promise<ExecutionContext> {
        // Implement the logic to retrieve the current execution context

    }
}