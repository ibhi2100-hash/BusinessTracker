import { ExecutionContext } from "../../KarnelTypes/types";

export interface ExecutionContextProviderContract {
    current(): ExecutionContext;
    refresh(): Promise<void>
}