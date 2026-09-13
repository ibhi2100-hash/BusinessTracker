import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { EventStatementKeys } from "./Keys";


export class EventStatements {

    constructor(
        private readonly manager: PreparedStatementManager
    ) {}
    get insert(){
        return this.manager.get(EventStatementKeys.insert)
        }
    
    get loadEvent(){
        return this.manager.get(EventStatementKeys.loadEvent)
    }

    get count(){
        return this.manager.get(EventStatementKeys.eventCount)
    }
    
    get loadAggregate(){
        return this.manager.get(EventStatementKeys.loadAggregates)
    }

    get loadProjectionEvents(){
        return this.manager.get(EventStatementKeys.loadProjectionEvent)
    }

    get loadAll(){
        return this.manager.get(EventStatementKeys.loadAll)
    }

    get streamEvent(){
        return this.manager.get(EventStatementKeys.eventStream)
    }

}