// controllers/offlineSync.controller.ts
import type { Request, Response } from "express";
import { OfflineSyncService } from "../service/offlineSync.service.js";

export class OfflineSyncController {
  constructor(private syncService: OfflineSyncService) {}

  async sync(req: Request, res: Response) {

    const events = req.body.events; // array of offline events
    console.log("Received offline sync events:", events);
    try {
      const result = await this.syncService.processEvent(events);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: " Failed to synch",
        err
      });
    }
  }
}