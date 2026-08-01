import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { logicClockKeys } from "./Keys";

export class LogicClockStatements {
    constructor(
        private readonly manager: PreparedStatementManager
    ){}

    get current(){
        return this.manager.get(logicClockKeys.getclock)
    }

    get next(){
        return this.manager.get(logicClockKeys.getclock)
    }

    async update(clock: number): Promise<void> {
        await this.manager.get(logicClockKeys.updateClock).execute([clock]);
    }
}