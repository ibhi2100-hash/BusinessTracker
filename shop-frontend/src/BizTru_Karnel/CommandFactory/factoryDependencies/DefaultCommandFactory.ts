import { EventFactory } from "../CommandFactory";
import { CommandIntent } from "../CommandIntent";
import { CommandRegistry } from "./CommandRegistry";
import { MetadataBuilder } from "../../MetadataBuilder/MetadataBuilderContract";
import { IdGenerator } from "./IdGenerators";
import { BusinessContext, Command } from "@/src/BizTru_Karnel/KarnelTypes/types"


export class DefaultCommandFactory implements EventFactory {
    constructor(
        private readonly registry: CommandRegistry,
        private readonly context: BusinessContext,
        private readonly metadataBuilder: MetadataBuilder,
        private readonly idGenerator: IdGenerator
    ){}

     async create<TPayload>(
        intent: CommandIntent<TPayload>
    ): Promise<Command<TPayload>> {

        const descriptor = 
            this.registry.resolve(intent.type);

        const context = 
            await this.context.current();

        const metadata = 
            this.metadataBuilder.build(context)

        const commandId = 
            this.idGenerator.next();

        const command: Command<TPayload> = Object.freeze({
            id: commandId,
            type: descriptor.type,
            aggregateId: descriptor,
            aggregateType: descriptor.aggregateType,
            payload: intent.payload,
            actor: context.actor,
            metadata: metadata,

        })

        return command;
    }
}