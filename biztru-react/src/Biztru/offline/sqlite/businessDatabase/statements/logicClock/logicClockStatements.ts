import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { logicClockKeys } from "./Keys";

export class LogicClockStatements {
    private readonly manager: PreparedStatementManager;
    constructor(
        manager: PreparedStatementManager
    ){
        this.manager = manager
    }

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