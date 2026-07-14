import { Actor}
export interface CommandContext {

    actor: ;

    businessId: string;

    branchId: string;

    deviceId: string;

    sessionId: string;

    correlationId: string;

}

export interface CommandContextProvider {

    current(): Promise<CommandContext>;

}