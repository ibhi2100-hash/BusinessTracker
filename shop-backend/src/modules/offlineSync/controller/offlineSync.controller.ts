// controllers/offlineSync.controller.ts
import type { Request, Response } from "express";
import { OfflineSyncService } from "../service/offlineSync.service.js";
import strict from "node:assert/strict";


export class OfflineSyncController {
  constructor(private syncService: OfflineSyncService) {}

  async sync(req: Request, res: Response) {

    const  events  = req.body;
    console.log("Event that hits the backend: ", events)
    if (!Array.isArray(events)) {
      return res.status(400).json({
        message: "Invalid payload. 'events' must be an array."
      });
    }

    console.log("Received offline sync events:", events.length);

    try {

      const results = await this.syncService.syncEvents(events);

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
  
  async getBranchEvent(req: Request, res: Response) {

    const businessId = req.user?.businessId;
        if(!businessId) {
          return res.status(400).json({ message: "Business ID not found in user context"});
          }
        const branchId = req.user?.branchId
            console.log("BRANCH ID: ", branchId)
            if(!branchId) {
                return res.status(400).json({ message: "Branch ID not found"})
            }


    try {

      const result = await this.syncService.getBusinessEvents(businessId, branchId);

      return res.status(200).json({
        success: true,
        result,
      });

    } catch (error) {

      console.error("Offline sync failed:", error);

      return res.status(500).json({
        success: false,
        message: "Offline sync failed",
      });
    }
  };
    async getBusinessSnapShot(req: Request, res: Response) {

    const businessId = req.user?.businessId;
        if(!businessId) {
          return res.status(400).json({ message: "Business ID not found in user context"});
          }
        const branchId = req.user?.branchId
            console.log("BRANCH ID: ", branchId)
            if(!branchId) {
                return res.status(400).json({ message: "Branch ID not found"})
            }

    try {

      const results = await this.syncService.getBusinessEvents

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

  async getProcessedProducts(businessId: stringify, branchId: string) {
      
    }

}