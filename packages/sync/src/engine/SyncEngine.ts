import { SyncConfig } from "../types/SyncConfig";

import { RetryEngine } from "./RetryEngine";

import { SyncService } from "../services/SyncService";
import { FailureService } from "../services/FailureService";
import { AggregateSyncService } from "../services/AggragateSyncService";

export class SyncEngine {

  private retryEngine:
    RetryEngine;

  private syncService:
    SyncService;

  private running =
    false;

  constructor(
    private config:
      SyncConfig
  ) {

    const failureService =
      new FailureService(
        config.repository,
        config.maxRetry
      );

    const aggregateSync =
      new AggregateSyncService(
        config.repository,
        config.transport
      );

    this.retryEngine =
      new RetryEngine(
        config.repository
      );

    this.syncService =
      new SyncService(
        config.repository,
        aggregateSync,
        failureService,
        config.conflictResolver
      );
  }

  async sync() {

    if (this.running) {
      return;
    }

    if (
      !this.config
        .connectivity
        .isOnline()
    ) {
      return;
    }

    this.running = true;

    try {

      await this.retryEngine
        .execute();

      await this.syncService
        .execute();

    } finally {

      this.running = false;
    }
  }
}