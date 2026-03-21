import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class SaleRepository {
  async create(
  data: {
    businessId: string;
    branchId: string;
    totalAmount: number;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      costPrice: number;
      totalPrice: number;
    }[];
    payments: {
      amount: number;
      method: any;
    }[];
  },
  tx: Prisma.TransactionClient
) {
  return tx.sale.create({
    data: {
      id: crypto.randomUUID(), // IMPORTANT (no default in schema)

      businessId: data.businessId,
      branchId: data.branchId,
      totalAmount: new Prisma.Decimal(data.totalAmount),

      items: {
        create: data.items.map(item => ({
          id: crypto.randomUUID(),

          productId: item.productId,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          costPrice: new Prisma.Decimal(item.costPrice),
          totalPrice: new Prisma.Decimal(item.totalPrice)
        }))
      },

      payments: {
        create: data.payments.map(p => ({
          id: crypto.randomUUID(),

          amount: new Prisma.Decimal(p.amount),
          method: p.method
        }))
      }
    },
    include: {
      items: true,
      payments: true
    }
  });
}
  async findSellableProduct(
    productId: string,
    businessId: string,
    branchId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.product.findFirst({
      where: {
        id: productId,
        businessId,
        branchId,
        isActive: true,
      },
    });
  }

  async findCompletedSale(
    id: string,
    businessId: string,
    branchId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.sale.findFirst({
      where: { id, businessId, branchId, status: "COMPLETED" },
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
}