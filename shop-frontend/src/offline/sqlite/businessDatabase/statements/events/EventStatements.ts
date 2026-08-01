import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { EventStatmentKeys } from "./Keys";


export class EventStatements {

    constructor(
        private readonly manager: PreparedStatementManager
    ) {}
    get insert(){
        return this.manager.get(EventStatmentKeys.insert)
        }
    
    get loadEvent(){
        return this.manager.get(EventStatmentKeys.loadEvent)
    }

    get loadSince(){
        return this.manager.get(EventStatmentKeys.loadSince)
    }

    get count(){
        return this.manager.get(EventStatmentKeys.eventCount)
    }
    get lastPosition(){
        return this.manager.get(EventStatmentKeys.eventLastposition)
    }



}