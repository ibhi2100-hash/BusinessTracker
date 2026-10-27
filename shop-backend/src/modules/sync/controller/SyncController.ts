import type { Request, Response } from "express";
import { OfflineSyncService, SyncInputError } from "../service/SyncService.js"
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

async pullEvent(req: Request, res: Response) {
  try {
    const businessId =
      typeof req.query.businessId === "string"
        ? req.query.businessId
        : "";

    const cursor =
      typeof req.query.cursor === "string"
        ? req.query.cursor
        : "0";

    const rawLimit = req.query.limit;
    const limit =
      rawLimit === undefined
        ? 100
        : typeof rawLimit === "string"
          ? Number(rawLimit)
          : Number.NaN;

    const result = await this.syncService.pull({
      businessId,
      cursor,
      limit,
    });

    return res.status(200).json(serializeBigInt(result));
  } catch (error: unknown) {
    if (error instanceof SyncInputError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("[SYNC_PULL_ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Pull sync failed.",
    });
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