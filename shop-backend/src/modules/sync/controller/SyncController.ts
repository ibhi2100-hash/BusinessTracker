import type { Request, Response } from "express";
import { OfflineSyncService } from "../service/SyncService.js"
import { serializeBigInt } from "../../../helpers/bigintSerializer.js";

export class OfflineSyncController {
  constructor(private syncService: OfflineSyncService) {}

  async pushEvent(req: Request, res: Response) {

    try {

        const events =
            req.body?.events;


        if (!Array.isArray(events)) {

            return res.status(400).json({
                success: false,
                message: "Events must be an array",
            });
        }

        const result =
            await this.syncService.push(
                events
            );


        return res
            .status(200)
            .json(
                serializeBigInt(result)
            );

    } catch (error: any) {

        console.error(
            "SYNC_ERROR:",
            error
        );

        return res
            .status(500)
            .json(
                serializeBigInt({
                    success: false,
                    message:
                        error?.message ??
                        "Sync failed",
                })
            );
    }
}

  async getAggregateEvents(){
    
  }

  async bootstrap(req: Request, res: Response) {

    try {

        const { businessId, branchId} = req.body;

        const result =
            await this.syncService.bootstrap(businessId, branchId)


        return res
            .status(200)
            .json(
                serializeBigInt(result)
            );

    } catch (error: any) {

        console.error(
            "SYNC_ERROR:",
            error
        );

        return res
            .status(500)
            .json(
                serializeBigInt({
                    success: false,
                    message:
                        error?.message ??
                        "Sync failed",
                })
            );
    }
}
}