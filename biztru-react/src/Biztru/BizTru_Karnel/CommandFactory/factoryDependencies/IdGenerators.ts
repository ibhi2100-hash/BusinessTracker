import type{ IdGeneratorContract } from "./IdGeneratorContract"

export class IdGenerator
implements IdGeneratorContract {
    
    next(): string {
        const commandId = crypto.randomUUID();

        return commandId
    }
}