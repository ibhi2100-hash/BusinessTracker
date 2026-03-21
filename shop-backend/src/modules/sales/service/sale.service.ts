import { SaleRepository } from "../repository/sale.repository.js";
import { InventoryService } from "../../inventory/service/inventory.service.js";
import { AlertService } from "../../alerts/service/alerts.service.js";
import { PrismaClient } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

// --- Define missing types/constants ---
interface SaleProductSnapshot {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
}

const LOW_STOCK_THRESHOLD = 2; // Adjust this per your business rules

export class SaleService {
  constructor(
    private saleRepo: SaleRepository,
    private inventoryService: InventoryService,
    private alertService: AlertService
  ) {}

  async createSale(
    dto: any,
    businessId: string,
    branchId: string,
    tx: PrismaClient
  ) {
    let totalAmount = 0;
    const snapshots: SaleProductSnapshot[] = [];

    // --- Prepare sale items and snapshots ---
    for (const item of dto.items) {
      const product = await this.saleRepo.findSellableProduct(
        item.productId,
        businessId,
        branchId,
        tx
      );

      if (!product) {
        throw new Error(`Product ${item.productId} not sellable`);
      }

      const sellingPrice = Number(product.sellingPrice);
      const costPrice = Number(product.costPrice);
      const totalPrice = sellingPrice * item.quantity;
      totalAmount += totalPrice;

      snapshots.push({
        id: dto.id,
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        sellingPrice,
        costPrice,
      });
    }

    // --- Validate payment total ---
    const paymentTotal = dto.payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0
    );

    if (paymentTotal !== totalAmount) {
      throw new Error("Payment amount mismatch");
    }

    // --- Reduce stock ---
    const updatedProducts = await this.inventoryService.reduceStockFromSnapshot(
      businessId,
      branchId,
      snapshots,
      tx
    );

    // --- Create low stock alerts ---
    for (const p of updatedProducts) {
      const before = p.before;
      const after = p.after;
      const crossedThreshold =
        before.quantity > LOW_STOCK_THRESHOLD &&
        after.quantity <= LOW_STOCK_THRESHOLD;

      if (crossedThreshold) {
        await this.alertService.createAlert({
          businessId,
          branchId,
          type: "LOW_STOCK",
          severity: after.quantity === 0 ? "CRITICAL" : "WARNING",
          title: "Low Stock",
          message: `${after.name} only ${after.quantity} left`,
          metadata: { productId: after.id },
        });
      }
    }

    // --- Store sale and payments ---
    return this.saleRepo.create(
      {
        businessId,
        branchId,
        totalAmount,
        items: snapshots.map((s) => ({
          productId: s.productId,
          quantity: s.quantity,
          unitPrice: s.sellingPrice,
          costPrice: s.costPrice,
          totalPrice: s.sellingPrice * s.quantity,
        })),
        payments: dto.payments,
      },
      tx
    );
  }

  async refundSale(
    saleId: string,
    businessId: string,
    branchId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const sale = await this.saleRepo.findCompletedSale(
        saleId,
        businessId,
        branchId,
        tx
      );

      if (!sale) {
        throw new Error("Sale not found or already refunded");
      }

      for (const item of sale.items) {
        await this.inventoryService.reverseStock(
          {
            productId: item.productId,
            quantity: item.quantity,
          },
          tx
        );
      }

      return this.saleRepo.refundSale(saleId, tx);
    });
  }
}