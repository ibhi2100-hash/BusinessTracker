import type{ CommandFactory } from "./CommandFactoryContract";
import type{ CommandIntent } from "../CommandIntent";
import type{ IdGenerator } from "./IdGenerators";
import type{ ActorContext } from "@business/shared-types";
import type { Command } from "../../KarnelTypes/types"; 
import type{ ExecutionContextProvider } from "../ExecutionContext/ExecutionContext";



export class DefaultCommandFactory implements CommandFactory {
    
    private readonly context: ExecutionContextProvider
    private readonly idGenerator: IdGenerator
    constructor(
        context: ExecutionContextProvider,
        idGenerator: IdGenerator,
    ){
        this.context = context;
        this.idGenerator = idGenerator
    }

    async create<TPayload>(
        intent: CommandIntent<TPayload>
    ): Promise<Command<TPayload>> {
        
        const context = await this.context.current();
       
        const commandId = 
            this.idGenerator.next();
        const actorData: ActorContext = {
            userId: context.actorId!,
            deviceId: context.deviceId,
            sessionId: context.sessionId!
        }
        const command: Command<TPayload> = Object.freeze({
            id: commandId,
            
            type: intent.type,
            mode: intent.mode,
            aggregateId: intent.aggregateId,
            aggregateType: intent.aggregateType,
            payload: intent.payload,
            causationId: crypto.randomUUID(),
            correlationId: crypto.randomUUID(),
            status: "PENDING",
            actor: actorData,
            createdAt: Date.now(),
          
        })

        return command;
    }
}