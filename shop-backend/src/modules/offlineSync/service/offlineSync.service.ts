import { SaleService } from "../../sales/service/sale.service.js";
import { ProductService } from "../../products/service/product.service.js";
import { AssetService } from "../../assets/service/asset.service.js";
import { LiabilityService } from "../../liability/service/liability.service.js";
import { OnboardingService } from "../../onboarding/service/onboarding.service.js";

import { Events } from "../dto/event.js";
import { SyncRepository } from "../repository/syncRepository.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { PrismaClient } from "@prisma/client/extension";

export class OfflineSyncService {

  constructor(
    private syncRepository: SyncRepository,
    private saleService: SaleService,
    private productService: ProductService,
    private assetService: AssetService,
    private liabilityService: LiabilityService,
    private onboardingService: OnboardingService
  ) {}

  async processEvents(events: Events[]) {

    const results: any[] = [];

    for (const event of events) {

      try {

        const result = await this.processEvent(event);

        results.push({
          eventId: event.id,
          status: result.status
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

  async processEvent(event: Events) {

    this.validateEvent(event);

    const alreadyProcessed = await this.syncRepository.isProcessed(event.id);

    if (alreadyProcessed) {
      return { status: "duplicate" };
    }

    await prisma.$transaction(async (tx) => {

      await this.executeEvent(event, tx);

      await this.syncRepository.markProcessed({
        id: event.id,
        type: event.type,
        businessId: event.businessId,
        branchId: event.branchId,
        userId: event.userId,
        version: event.version
      }, tx);

    });

    return { status: "synced" };
  }

  validateEvent(event: Events) {

    if (!event.id) {
      throw new Error("Event ID missing");
    }

    if (!event.type) {
      throw new Error("Event type missing");
    }

  }

  async executeEvent(
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
          event.payload.data,
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