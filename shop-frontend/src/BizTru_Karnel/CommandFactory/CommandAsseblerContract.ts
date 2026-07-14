import { CommandMetadata } from "../MetadataBuilder/MetadataBuilderContract";
import { CommandDescriptor } from "./CommandDescriptor";
import { CommandContext } from "./factoryDependencies/EventContext";
import { CommandIntent } from "./CommandIntent";


export interface CommandAssembly<TPayload>{
    descriptor: CommandDescriptor;
    context: CommandContext;
    metadata: CommandMetadata;
    commandId: string;
    aggregateId: string;
    aggregateVersion: number;
    payload: TPayload;

}

export interface CommandAssembler {

    assemble<TPayload>(
        intent: CommandIntent<TPayload>
    ): Promise<CommandAssembly<TPayload>>;

}