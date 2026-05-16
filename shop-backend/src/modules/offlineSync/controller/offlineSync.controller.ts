import type { Request, Response } from "express";
import { OfflineSyncService } from "../service/offlineSync.service.js";

export class OfflineSyncController {
  constructor(private syncService: OfflineSyncService) {}

  async sync(req: Request, res: Response) {
    try {
      const { aggregateId, aggregateType, baseVersion, events } = req.body;

      if (!aggregateId || !aggregateType || !Array.isArray(events)) {
        return res.status(400).json({
          message: "Invalid sync payload",
        });
      }

      const result = await this.syncService.syncAggregateBatch({
        aggregateId,
        aggregateType,
        baseVersion,
        events,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("SYNC_ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Sync failed",
      });
    }
  }

  async getAggregateEvents(req: Request, res: Response) {
    try {
      const { aggregateId, aggregateType, version } = req.query;

      const events =
        await this.syncService.getAggregateEventsAfterVersion(
          String(aggregateId),
          String(aggregateType),
          Number(version)
        );

      return res.json({
        success: true,
        events,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
      });
    }
  }
}