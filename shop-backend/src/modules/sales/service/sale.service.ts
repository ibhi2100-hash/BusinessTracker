import { prisma } from "../../../infrastructure/postgresql/prismaClient.js"
import { SaleRepository } from "../repository/sale.repository.js";
import { InventoryService } from "../../inventory/service/inventory.service.js";
import { SaleProductSnapshot } from "../dto/saleproductsnap.js";
import { AlertService } from "../../alerts/service/alerts.service.js";
import { LOW_STOCK_THRESHOLD } from "../../../config/inventory.config.js";







export class SaleService {
  constructor(
    private saleRepo: SaleRepository,
    private inventoryService: InventoryService,
    private alertService: AlertService
  ){}
  
  

async createSale(dto: any, businessId: string, branchId: string) {
  return prisma.$transaction(async (tx) => {

    let totalAmount = 0;
    const snapshots: SaleProductSnapshot[] = [];

    for (const item of dto.items) {

      const product =
        await this.saleRepo.findSellableProduct(
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
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        sellingPrice,
        costPrice
      });

    }

    // Validate payments
    const paymentTotal = dto.payments.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0
    );

    if (paymentTotal !== totalAmount) {
      throw new Error("Payment amount mismatch");
    }

    // Inventory operation (NO re-fetch)
    const updatedProducts = await this.inventoryService.reduceStockFromSnapshot(
                              businessId,
                              branchId,
                              snapshots,
                              tx
                            );
    for ( const p of updatedProducts){

      const before = p.before;
      const after = p.after;
      const crossedThreshold = 
      before.quantity > LOW_STOCK_THRESHOLD &&
      after.quantity <= LOW_STOCK_THRESHOLD;

      if(crossedThreshold) {
        await this.alertService.createAlert({
          businessId,
          branchId,
          type: "LOW_STOCK",
          severity: after.quantity === 0 ? "CRITICAL" : "WARNING",
          title: "Low Stock",
          message: `${after.name} only ${after.quantity} left`,
          metadata: { productId: after.id}
        })
      }
    }

    const sale = await this.saleRepo.create({
      businessId,
      branchId,
      totalAmount,
      items: snapshots.map(s => ({
        productId: s.productId,
        quantity: s.quantity,
        unitPrice: s.sellingPrice,
        costPrice: s.costPrice,
        totalPrice: s.sellingPrice * s.quantity
      })),
      payments: dto.payments
    }, tx);

    await this.saleRepo.createCashflow({
      businessId,
      branchId,
      amount: totalAmount,
      type: "INFLOW",
      source: "SALE",
      description: `Sale ID: ${sale.id}`
    }, tx);
    

    return sale;
  });
}

  async refundSale(saleid: string, businessId: string, branchId: string ){
    return prisma.$transaction(async (tx) => {
        const sale = 
            await this.saleRepo.findCompletedSale(
                saleid,
                businessId,
                branchId,
                tx
            )
            if(!sale) {
                throw new Error("Sale not found or already refunded")
            }

            for (const item of sale.items ){
                await this.inventoryService.reverseStock(
                    {
                        productId: item.productId,
                        quantity: item.quantity
                    },
                    tx
                )
            }

            await this.saleRepo.createRefundCashflow(
                {
                    businessId,
                    branchId,
                    amount: sale.totalAmount.toNumber(),
                    saleId: sale.id
                },
                tx
            )
    })
  }
}
