// controllers/offlineSync.controller.ts
import type { Request, Response } from "express";
import { OfflineSyncService } from "../service/offlineSync.service.js";
import { snapshot } from "node:test";

export class OfflineSyncController {
  constructor(private syncService: OfflineSyncService) {}

  async sync(req: Request, res: Response) {

    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({
        message: "Invalid payload. 'events' must be an array."
      });
    }

    console.log("Received offline sync events:", events.length);

    try {

      const results = await this.syncService.processEvents(events);

      return res.status(200).json({
        success: true,
        results,
        snapshot: []
      });

    } catch (error) {

      console.error("Offline sync failed:", error);

      return res.status(500).json({
        success: false,
        message: "Offline sync failed",
      });
    }
  }
}