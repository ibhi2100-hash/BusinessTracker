import type { BusinessClock } from "../logicClockContract"
import { LogicClockRepository } from "../../offline/sqlite/businessDatabase/repositories/LogicClockRepository/LogicClockRepository"
export class SQLiteBusinessClock 
implements BusinessClock {
    private readonly repository: LogicClockRepository
    constructor(
        repository: LogicClockRepository
    ){
        this.repository = repository
    }

    async next(): Promise<number> {
        return await this.repository.next();
    }

    async current(): Promise<number> {
        return await this.repository.current();
    }
}