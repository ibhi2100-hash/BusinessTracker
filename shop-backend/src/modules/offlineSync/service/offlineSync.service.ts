import { SaleService } from "../../sales/service/sale.service.js";
import { ProductService } from "../../products/service/product.service.js";
import { AssetService } from "../../assets/service/asset.service.js";
import { LiabilityService } from "../../liability/service/liability.service.js";
import { OnboardingService } from "../../onboarding/service/onboarding.service.js";

import { Events } from "../dto/event.js";
import { SyncRepository } from "../repository/syncRepository.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma, PrismaClient } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { generateLedgerEntries } from "../../ledger/ledgerGenerator/ledgerGenerator.js";

export class OfflineSyncService {
  constructor(
    private syncRepository: SyncRepository,
    private saleService: SaleService,
    private productService: ProductService,
    private assetService: AssetService,
    private liabilityService: LiabilityService,
    private onboardingService: OnboardingService
  ) {}

  async syncEvents(events: Events[]) {
    const results: any[] = [];
    events.sort((a, b) => {
      if (a.type === "BUSINESS_CREATED") return -1;
      if (b.type === "BUSINESS_CREATED") return 1;
      return 0;
    });

    for (const event of events) {
      try {
        await prisma.$transaction(async (tx) => {

          // 1️⃣ Idempotency (event-level)
          const exists = await this.syncRepository.findExistingEvent(event.id, tx);
          if (exists) {
            results.push({ eventId: event.id, status: "duplicate" });
            return;
          }

          // 2️⃣ Store raw event
          await this.syncRepository.storeEvent(event, tx);

          // 3️⃣ Execute domain logic
          await this.executeEvent(event, tx);

          // 4️⃣ Generate ledger (shared deterministic logic)
          const entries = generateLedgerEntries(event);

          // 5️⃣ Validate double-entry integrity
          const total = entries.reduce((sum, e) => sum + e.amount, 0);
          if (total !== 0) {
            throw new Error(`Unbalanced ledger for event ${event.id}`);
          }

          // 6️⃣ Persist ledger (idempotent)
          await this.syncRepository.createLedger(entries, event.businessId, tx);

          // 7️⃣ Update account snapshots (ledger-driven)
          await this.syncRepository.updateAccountSnapshots(
            event.branchId,
            tx
          );

          // 8️⃣ Mark processed
          await this.syncRepository.markProcessed(event, tx);

          results.push({ eventId: event.id, status: "synced" });
        });

      } catch (error) {

        await this.syncRepository.markFailed(event, String(error));

        results.push({
          eventId: event.id,
          status: "failed",
          error: String(error)
        });
      }
    }

    return results;
  }

  private async executeEvent(
    event: Events,
    tx: PrismaClient
  ) {
    switch (event.type) {

      case "SALE_ADDED":
        return this.saleService.createSale(
          event.payload,
          event.businessId,
          event.branchId,
          tx
        );

      case "PRODUCT_CREATED":
        return this.productService.createProduct(
          event.payload,
          event.businessId,
          event.branchId,
          tx
        );

      case "PRODUCT_UPDATED":
        return this.productService.updateProductPartial(
          event.payload.productId,
          event.payload,
          event.businessId,
          event.branchId,
          tx
        );

      case "ASSET_ADDED":
        return this.assetService.createAsset(
          event.businessId,
          event.branchId,
          event.payload,
          tx
        );

      case "ASSET_DISPOSED":
        return this.assetService.disposeAsset(
          event.payload.assetId,
          event.businessId,
          event.branchId,
          event.payload,
          tx
        );

      case "LIABILITY_ADDED":
        return this.liabilityService.createLiability(
          event.businessId,
          event.branchId,
          event.payload,
          tx
        );

      case "LIABILITY_REPAYMENT":
        return this.liabilityService.repayLiability(
          event.payload.liabilityId,
          event.businessId,
          event.branchId,
          event.payload,
          tx
        );

      case "BUSINESS_CREATED":
        return this.onboardingService.createBusiness(
          event.userId,
          event.payload,
          tx
        );

      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  }
}