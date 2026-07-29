import { LogicClockStatement } from "./logicClockStatement";

export class LogicClockRepository {
    constructor(
        private readonly statements: LogicClockStatement
    ){}

    async currentClock(): Promise<number>{
        return await this.statements.getCurrentClock()
    }

    async incrementClock(clock: number):Promise<void>{
        await this.statements.incrementClock(clock)
    }
}