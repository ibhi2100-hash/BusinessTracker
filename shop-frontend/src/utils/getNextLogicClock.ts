import { LogicClockRepository } from "../offline/sqlite/clientDatabase/repositories/LogicClockRepository/LogicClockRepository";
import { LogicClockStatement } from "../offline/sqlite/clientDatabase/repositories/LogicClockRepository/logicClockStatement";
import { StorageBusCreator } from "../offline/sqlite/bus/StorageBusCreator";

export async  function getNextLogicClock(){
    const storage = StorageBusCreator();
    const logicStatement = new  LogicClockStatement(storage);
    const logicRepo = new LogicClockRepository(logicStatement);

    const currentClock =await logicRepo.currentClock()
    const nextLogicClock = currentClock + 1;
    logicRepo.incrementClock(nextLogicClock);
    
    return nextLogicClock
}