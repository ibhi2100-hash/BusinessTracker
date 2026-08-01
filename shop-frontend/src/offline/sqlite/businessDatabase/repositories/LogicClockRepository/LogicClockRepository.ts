import { LogicClockStatements } from "../../statements/logicClock/logicClockStatements"

export class LogicClockRepository {
    constructor(
        private readonly statements: LogicClockStatements
    ){}

    async current(): Promise<number>{
        const result = await this.statements.current.query() as Array<{ value: number }>;
        if(result.length === 0){
            throw new Error("Logic clock not found");
        }
        return result[0].value;
    }

    async next(): Promise<number>{
        const current  = await this.current();
        const next = current + 1;
        await this.statements.update(next);

        return next;
    }
}