import { CashFlowType, Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { SaleItemDto } from "../dto/saleItem.dto.js";
export class SaleRepository {
  async create(data: {
    businessId: string;
    totalAmount: number;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    payments: {
        amount: number;
        method: any;
    }[];

  }, tx: Prisma.TransactionClient) {
    return tx.sale.create({
      data: {
        businessId: data.businessId,
        totalAmount: data.totalAmount,
        items: { create: data.items },
        payments: { create: data.payments },
      },
      include: {
        items: true,
        payments: true,
      }
    });
  }

  async findCompletedSale(id: string, businessId: string, tx: Prisma.TransactionClient) {
    return tx.sale.findFirst({
      where: { id, businessId, status: "COMPLETED" },
      include: { items: true },
    });
  }

  async refundSale(id: string, tx: Prisma.TransactionClient) {
    return tx.sale.update({
      where: { id },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
      },
    });
  }
  async createCashflow (
  params: {
    businessId: string;
    amount: number;
    type: CashFlowType;
    source: string;
    description?: string
  },
  tx: Prisma.TransactionClient
){
  return tx.cashFlow.create({
    data: {
      businessId: params.businessId,
      amount: params.amount,
      type: params.type,
      source: params.source,
      description: params.description ?? null,
    }
  })
};

async createRefundCashflow(
  params: {
    businessId: string;
    amount: number;
    saleId: string
  },
  tx: Prisma.TransactionClient
){
  return tx.cashFlow.create({
    data: {
      businessId: params.businessId,
      type: "OUTFLOW",
      amount: params.amount,
      source: "SALE_REFUND",
      description: `Refund for sale ${params.saleId} `
    }
    })
}
}


