import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { conflictKeys } from "./conflictKeys";

export class ConflictsStatements {
   
    constructor(
      private readonly   manager: PreparedStatementManager
    ){}

    get getPending(){
        return this.manager.get(
            conflictKeys.getPendingConflicts
        )
    }

    get insert() {
    return this.manager.get(conflictKeys.insert);
    }

    get upsert() {
        return this.manager.get(conflictKeys.upsert);
    }

    get findById() {
        return this.manager.get(conflictKeys.findById);
    }

    get findByAggregate() {
        return this.manager.get(conflictKeys.findByAggregate);
    }

    get findByStatus() {
        return this.manager.get(conflictKeys.findByStatus);
    }

    get findPending() {
        return this.manager.get(conflictKeys.findPending);
    }

    get findPendingByAggregate() {
        return this.manager.get(conflictKeys.findPendingByAggregate);
    }

    get resolve() {
        return this.manager.get(conflictKeys.resolve);
    }

    get updateStatus() {
        return this.manager.get(conflictKeys.updateStatus);
    }

    get deleteById() {
        return this.manager.get(conflictKeys.deleteById);
    }

    get deleteByAggregate() {
        return this.manager.get(conflictKeys.deleteByAggregate);
    }

    get countByStatus() {
        return this.manager.get(conflictKeys.countByStatus);
    }

}