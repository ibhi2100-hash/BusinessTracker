import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { syncActivityKeys } from "./syncActivityKeys";

export class SyncActivityStatements {
  constructor(
    private readonly manager: PreparedStatementManager
  ) {}

  get insert() {
    return this.manager.get(syncActivityKeys.insert);
  }

  get findById() {
    return this.manager.get(syncActivityKeys.findById);
  }

  get findByActivityId() {
    return this.manager.get(syncActivityKeys.findByActivityId);
  }

  get findRecent() {
    return this.manager.get(syncActivityKeys.findRecent);
  }

  get findByType() {
    return this.manager.get(syncActivityKeys.findByType);
  }

  get findByStatus() {
    return this.manager.get(syncActivityKeys.findByStatus);
  }

  get findByEvent() {
    return this.manager.get(syncActivityKeys.findByEvent);
  }

  get findByAggregate() {
    return this.manager.get(syncActivityKeys.findByAggregate);
  }

  get findByTypeAndRange() {
    return this.manager.get(syncActivityKeys.findByTypeAndRange);
  }

  get findInRange() {
    return this.manager.get(syncActivityKeys.findInRange);
  }

  get findErrors() {
    return this.manager.get(syncActivityKeys.findErrors);
  }

  get countByType() {
    return this.manager.get(syncActivityKeys.countByType);
  }

  get deleteOlderThan() {
    return this.manager.get(syncActivityKeys.deleteOlderThan);
  }

  get deleteById() {
    return this.manager.get(syncActivityKeys.deleteById);
  }
}