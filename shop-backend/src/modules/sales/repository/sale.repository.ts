import { CashFlowType, PaymentMethod, Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { SaleItemDto } from "../dto/saleItem.dto.js";
export class SaleRepository {
  async create(data: {
    businessId: string;
    branchId: string;
    totalAmount: number;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    payments: {
        amount: number;
        method: PaymentMethod;
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

  async findCompletedSale(id: string, businessId: string, branchId: string, tx: Prisma.TransactionClient) {
    return tx.sale.findFirst({
      where: { id, businessId,branchId, status: "COMPLETED" },
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
    branchId: string;
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
      branchId: params.branchId,
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
    branchId: string;
    amount: number;
    saleId: string
  },
  tx: Prisma.TransactionClient
){
  return tx.cashFlow.create({
    data: {
      businessId: params.businessId,
      branchId: params.branchId,
      type: "OUTFLOW",
      amount: params.amount,
      source: "SALE_REFUND",
      description: `Refund for sale ${params.saleId} `
    }
    })
}
}


