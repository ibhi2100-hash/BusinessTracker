import { CommandFactory } from "../CommandFactory";
import { CommandIntent } from "../CommandIntent";
import { ExecutionContextProvider } from "../ExecutionContext";
import { CommandValidator } from "./CommandValidator";
import { Command } from "../../KarnelTypes/types"
import { CommandRegistry } from "../CommandRegistry";
import { MetadataBuilder } from "./MetadataBuilder";
import { IdGenerator } from "./IdGenerator";

export class DefaultCommandFactory implements CommandFactory {
    constructor(
        private readonly registry: CommandRegistry,
        private readonly context: ExecutionContextProvider,
        private readonly metadataBuilder: MetadataBuilder,
        private readonly validator: CommandValidator,
        private readonly idGenerator: IdGenerator
    ){}

    create<TPayload>(
        intent: CommandIntent<TPayload>
    ): Command<TPayload> {

        const descriptor = 
            this.registry.resolve(intent.type);

        const context = 
            this.context.current();

        const metadata = 
            this.metadataBuilder.build(context)

        const commandId = 
            this.idGenerator.next();

        const command: Command<TPayload> = Object.freeze({
            id: commandId,
            type: descriptor.type,
            aggregateId: descriptor.aggregateId,
            aggregateType: descriptor.aggregateType,
            payload: intent.payload,
            actor: context.actor,
            metadata: metadata,
            version: descriptor.version
        })

        this.validator.validate(command, descriptor.schema);

        return command;
    }
}