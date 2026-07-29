import { ActorContext } from "@business/shared-types";
export interface CommandContext {

    actor: ActorContext;

    businessId: string;

    branchId: string;

    deviceId: string;

    sessionId: string;

    correlationId: string;

}

export interface CommandContextProvider {

    current(): Promise<CommandContext>;

}