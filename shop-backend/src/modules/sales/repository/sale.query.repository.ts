import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class SaleQueryRepository {
  async findSellableProduct(
    productId: string,
    businessId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.product.findFirst({
      where: {
        id: productId,
        businessId,
        isActive: true,
      },
    });
  }
}
