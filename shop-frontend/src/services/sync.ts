import { SQLiteSyncRepository } from "../offline/sqlite/businessDatabase/repositories/SQLiteSyncRepository/SQLiteSyncRepository";
import { HttpSyncApi } from "../sync/HttpSyncApi";
import { ExponentialRetryPolicy } from "../sync/RetryPolicies/ExponentialRetryPolicy";

import { SyncEngine } from "@business/sync";
import { SyncManager } from "@business/sync";
import { RetryEngine } from "@business/sync";

import { AppConflictResolver } from "../conflict/ConflictResolver";

// merge strategies
import { ProductMergeStrategy } from "../strategies/ProductMergerStrategy";
import { StorageBusCreator } from "../offline/sqlite/bus/StorageBusCreator";
import { DatabaseTarget } from "../offline/sqlite/protocol/DatabaseTarget";



export function createSyncManager() {
  const storage = StorageBusCreator()

  // -------------------------
  // LOCAL REPOSITORY
  // -------------------------
  const repository =
    new SQLiteSyncRepository();

  // -------------------------
  // API (server sync layer)
  // -------------------------
  const api =
    new HttpSyncApi();

  // -------------------------
  // RETRY ENGINE
  // -------------------------
  const retry =
    new RetryEngine(
      repository,
      new ExponentialRetryPolicy({
        baseDelayMs: 2000,
        maxDelayMs: 5 * 60 * 1000,
        factor: 2,
        maxRetries: 8
      })
    );

  // -------------------------
  // MERGE STRATEGIES
  // -------------------------
  const strategies = new Map([
    ["PRODUCT", new ProductMergeStrategy()],
  ]);

  // -------------------------
  // CONFLICT RESOLVER
  // -------------------------
  const resolver =
    new AppConflictResolver(
      api,
      strategies
    );

  // -------------------------
  // SYNC ENGINE
  // -------------------------
  const engine =
    new SyncEngine(
      repository,
      api,
      retry,
      resolver
    );

  // -------------------------
  // MANAGER
  // -------------------------
  return new SyncManager(engine);
}