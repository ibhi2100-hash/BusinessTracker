import { StorageBus } from "../../../bus/StorageBus"
import { DatabaseTarget } from "../../../protocol/DatabaseTarget"
interface LogicClock {
    id: string,
    currentClock: number
}
export class LogicClockStatement {
    constructor(
        private readonly storage: StorageBus
    ){};
    async getCurrentClock(): Promise<number>{
        const rows =  await this.storage.query<LogicClock>(
            DatabaseTarget.CLIENT,
            `
                SELECT * FROM logic_clock
            `
        );

        const currentClock = rows[0].currentClock;
        return currentClock;
    }

    async incrementClock(clock: number): Promise<void>{
        await this.storage.execute(
            DatabaseTarget.CLIENT,
            `
                INSERT INTO logic_clock (
                    currentClock
                )
                VALUES(
                    ?
                )
            `,
            [clock]
        )
    }
}