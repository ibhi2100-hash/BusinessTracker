import { prisma } from "../../../infrastructure/postgresql/prismaClient.js"
import { SaleRepository } from "../repository/sale.repository.js";
import { InventoryService } from "../../inventory/service/inventory.service.js";
import { SaleQueryRepository } from "../repository/sale.query.repository.js";






export class SaleService {
  private saleRepo = new SaleRepository();
  private SaleQuenryRepository = new SaleQueryRepository();
  private inventoryService = new InventoryService
  

  async createSale(dto: any, businessId: string, branchId: string) {
    return prisma.$transaction(async (tx) => {

      let totalAmount = 0;
      const saleItems = [];

      for (const item of dto.items) {
        const product = 
            await this.SaleQuenryRepository.findSellableProduct(
                item.productId,
                businessId,
                tx
            )


        if (!product) {
          throw new Error("Invalid product");
        }

        const totalPrice = 
            Number(product.sellingPrice) * item.quantity;
            totalAmount += totalPrice;

        saleItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: Number(product.sellingPrice),
          totalPrice,
        });
      }

      const paymentTotal = dto.payments.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );

      if (paymentTotal !== totalAmount) {
        throw new Error("Payment amount mismatch");
      }

      await this.inventoryService.validateAndReduceStock(
        businessId,
        branchId,
        dto.items,
        tx
      );

      const sale = await this.saleRepo.create(
        {
          businessId,
          branchId,
          totalAmount,
          items: saleItems,
          payments: dto.payments,
        },
        tx
      );

      await this.saleRepo.createCashflow(
        {
            businessId,
            branchId,
            amount: totalAmount,
            type: "INFLOW",
            source: "SALE",
            description: `Sale ID: ${sale.id}`
        },
        tx
      )

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
