import { CommandDescriptor } from "../../CommandFactory/CommandDescriptor";
import { CommandIntent } from "../../CommandFactory/CommandIntent";
import { CommandMetadata } from "./MetadataBuilder";
import { ExecutionContext } from "../../CommandFactory/ExecutionContext";
import { Command } from "../../KarnelTypes/types";

interface CommandAssembler {

    assemble<TPayload>(
        descriptor: CommandDescriptor<unknown, TPayload>,
        intent: CommandIntent<TPayload>,
        context: ExecutionContext,
        metadata: CommandMetadata,
        id: string
    ): Command<TPayload>;
}