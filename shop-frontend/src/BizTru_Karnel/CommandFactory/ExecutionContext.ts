import { ActorContext } from "../KarnelTypes/types";

export interface ExecutionContext {

    readonly actor: ActorContext;

    readonly businessId: string;

    readonly branchId: string;

    readonly deviceId: string;

    readonly sessionId: string;

    readonly timestamp: number;

    readonly logicalClock: number;

    readonly correlationId: string;

}

export interface ExecutionContextProvider {
    current(): ExecutionContext;
}