import { BaseRepo } from "../baseRepo/baseRepo";
import { nanoid } from "nanoid";

interface RecordEventParams {
  mode: "OPENING" | "LIVE";

  event: {
    type: string;
    businessId: string;
    branchId: string;
    deviceId?: string;
  };
  ledgerEntries?: {
    businessId: string;
    branchId: string;
    account: string;
    amount: number;
  }[];
  inventoryUpdates?: {
    productId: string;
    branchId: string;
    quantity: number;
  }[];

  cashAtHand?: number; // optional for opening initialization

}

export class EventRepo extends BaseRepo {
  async recordEvent(params: RecordEventParams) {
  const now = Date.now();
  const eventId = nanoid();

  return this.tx(
    async () => {
      // 1. EVENT
      await this.db.events.add({
        id: eventId,
        type: params.event.type,
        mode: params.mode,
        businessId: params.event.businessId,
        branchId: params.event.branchId,
        deviceId: params.event.deviceId,
        status: "pending",
        synced: false,
        createdAt: now,
      });

      // 2. LEDGER
      if (params.mode === "LIVE" && params.ledgerEntries?.length) {
        await this.db.ledgerEntries.bulkAdd(
          params.ledgerEntries.map((entry) => ({
            id: nanoid(),
            eventId,
            businessId: entry.businessId,
            branchId: entry.branchId,
            account: entry.account,
            amount: entry.amount,
            createdAt: now,
          }))
        );
      }

      // 3. INVENTORY
      if (params.inventoryUpdates?.length) {
        for (const update of params.inventoryUpdates) {
          const existing = await this.db.inventory
            .where("[productId+branchId]")
            .equals([update.productId, update.branchId])
            .first();

          if (existing) {
            await this.db.inventory.update(existing.id, {
              quantity: existing.quantity + update.quantity,
              updatedAt: now,
            });
          } else {
            await this.db.inventory.add({
              id: nanoid(),
              productId: update.productId,
              branchId: update.branchId,
              quantity: update.quantity,
              updatedAt: now,
            });
          }
        }
      }

      return eventId;
    },
    this.db.events,
    this.db.ledgerEntries,
    this.db.inventory
  );
}
}
