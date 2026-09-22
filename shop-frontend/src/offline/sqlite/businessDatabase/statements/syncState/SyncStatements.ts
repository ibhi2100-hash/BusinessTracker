import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { syncStateKeys } from "./syncStateKeys";

export class SyncStateStatements {
  constructor(
    private readonly manager: PreparedStatementManager
  ) {}

  get upsert() {
    return this.manager.get(syncStateKeys.upsert);
  }

  get find() {
    return this.manager.get(syncStateKeys.find);
  }

  get updateStatus() {
    return this.manager.get(syncStateKeys.updateStatus);
  }

  get updateAfterSync() {
    return this.manager.get(syncStateKeys.updateAfterSync);
  }

  get incrementCounters() {
    return this.manager.get(syncStateKeys.incrementCounters);
  }

  get resetCounters() {
    return this.manager.get(syncStateKeys.resetCounters);
  }

  get setDeviceCursor() {
    return this.manager.get(syncStateKeys.setDeviceCursor);
  }

  get setError() {
    return this.manager.get(syncStateKeys.setError);
  }

  get clearError() {
    return this.manager.get(syncStateKeys.clearError);
  }
}