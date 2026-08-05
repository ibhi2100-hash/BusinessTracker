import { BusinessClock } from "../logicClockContract"
import { LogicClockRepository } from "../../offline/sqlite/businessDatabase/repositories/LogicClockRepository/LogicClockRepository"
export class SQLiteBusinessClock 
implements BusinessClock {
    constructor(
        private readonly repository: LogicClockRepository
    ){}

    async next(): Promise<number> {
        return await this.repository.next();
    }

    async current(): Promise<number> {
        return await this.repository.current();
    }
}