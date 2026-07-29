import { IdGeneratorContract } from "./IdGenerator";

export class IdGenerator
implements IdGeneratorContract {
    
    next(): string {
        const commandId = crypto.randomUUID();

        return commandId
    }
}