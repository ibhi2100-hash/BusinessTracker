import { CommandFactory } from "./CommandFactoryContract";
import { CommandIntent } from "../CommandIntent";
import { MetadataBuilder } from "../../MetadataBuilder/MetadataBuilder";

import { IdGenerator } from "./IdGenerators";
import { ActorContext } from "@business/shared-types";
import { Command } from "@/src/BizTru_Karnel/KarnelTypes/types"
import { ExecutionContextProvider } from "../ExecutionContext/ExecutionContext";



export class DefaultCommandFactory implements CommandFactory {
    

    constructor(
        private readonly context: ExecutionContextProvider,
        private readonly metadataBuilder: MetadataBuilder,
        private readonly idGenerator: IdGenerator,
    ){}

    async create<TPayload>(
        intent: CommandIntent<TPayload>
    ): Promise<Command<TPayload>> {
        console.log("Intent hit factory")
        const context = await this.context.current();
        console.log("this is the Context in the Factory:", context)
        const metadata = 
            await this.metadataBuilder.build(context)

        const commandId = 
            this.idGenerator.next();
        const actorData: ActorContext = {
            userId: context.actorId,
            deviceId: context.deviceId,
            sessionId: context.sessionId
        }
        const command: Command<TPayload> = Object.freeze({
            id: commandId,
            
            type: intent.type,
            mode: intent.mode,
            aggregateId: intent.aggregateId,
            aggregateType: intent.aggregateType,
            payload: intent.payload,
            actor: actorData,
            metadata: metadata,
            version: 1

        })

        return command;
    }
}