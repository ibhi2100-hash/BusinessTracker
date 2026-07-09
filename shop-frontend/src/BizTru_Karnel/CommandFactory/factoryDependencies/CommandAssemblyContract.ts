import { CommandDescriptor } from "../../CommandFactory/CommandDescriptor";
import { CommandIntent } from "../../CommandFactory/CommandIntent";
import { CommandMetadata } from "../../MetadataBuilder/MetadataBuilderContract";
import { ExecutionContext } from "../ExecutionContext/ExecutionContextContract";
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