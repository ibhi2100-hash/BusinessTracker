import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { aggregateStatementsKeys } from "./aggregateStatementsKeys";

export  class AggregateStatements {
    private readonly manager: PreparedStatementManager;
    constructor(
        manager: PreparedStatementManager
    ){
        this.manager = manager
    }

    get insert(){
        return this.manager.get(aggregateStatementsKeys.insert)
    }

    get getAggregate(){
        return this.manager.get(aggregateStatementsKeys.getAggregate)
    }

    get getVersion(){
        return this.manager.get(aggregateStatementsKeys.getVersion)
    }

    get getAllAggregate(){
        return this.manager.get(aggregateStatementsKeys.getAllAggregates)
    }

    get advanceLocal(){
        return this.manager.get(aggregateStatementsKeys.advanceLocal)
    }
}