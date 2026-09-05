import {
  Sales,
  SaleStatus,
  PaymentMethod,
  Mode,
} from "@business/shared-types";

import {
  Prisma,
  Sale,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import {
  prisma,
} from "../../../infrastructure/postgresql/prismaClient.js";


export interface SalesListFilters {
  branchId?: string | null;
  businessId?: string | null;
  productId?: string;
  from?: Date;
  to?: Date;
  status?: SaleStatus | null;
  limit?: number;
  offset?: number;
}


export interface SalesSummaryRow {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalQuantity: number;
  transactionCount: number;
  voidedCount: number;
  refundedAmount: number;
}


export class SalesRepository {

  constructor(
    private readonly db = prisma
  ) {}


  /*
   * ---------------------------------------------------------
   * Create / Upsert
   * ---------------------------------------------------------
   */

  async upsert(
    state: Sales
  ): Promise<void> {

    await this.db.sale.upsert(
      SalesMapper.toUpsertArgs(state)
    );

  }


  /*
   * ---------------------------------------------------------
   * Find by ID
   * ---------------------------------------------------------
   */

  async findById(
    id: string
  ): Promise<Sales | null> {

    const row =
      await this.db.sale.findUnique({
        where: {
          id,
        },
      });

    return row
      ? SalesMapper.fromRow(row)
      : null;

  }


  /*
   * ---------------------------------------------------------
   * Find all
   * ---------------------------------------------------------
   */

  async findAll(): Promise<Sales[]> {

    const rows =
      await this.db.sale.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return rows.map(
      SalesMapper.fromRow
    );

  }


  /*
   * ---------------------------------------------------------
   * Find by branch
   * ---------------------------------------------------------
   */

  async findByBranch(
    branchId: string
  ): Promise<Sales[]> {

    const rows =
      await this.db.sale.findMany({
        where: {
          branchId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return rows.map(
      SalesMapper.fromRow
    );

  }


  /*
   * ---------------------------------------------------------
   * Find by product
   * ---------------------------------------------------------
   */

  async findByProduct(
    productId: string
  ): Promise<Sales[]> {

    const rows =
      await this.db.sale.findMany({
        where: {
          productId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return rows.map(
      SalesMapper.fromRow
    );

  }


  /*
   * ---------------------------------------------------------
   * Find checkout group
   * ---------------------------------------------------------
   */

  async findByGroup(
    saleGroupId: string
  ): Promise<Sales[]> {

    const rows =
      await this.db.sale.findMany({
        where: {
          saleGroupId,
        },

        orderBy: {
          createdAt: "asc",
        },
      });

    return rows.map(
      SalesMapper.fromRow
    );

  }


  /*
   * ---------------------------------------------------------
   * Find by invoice
   * ---------------------------------------------------------
   */

  async findByInvoice(
    invoiceId: string
  ): Promise<Sales[]> {

    const rows =
      await this.db.sale.findMany({
        where: {
          invoiceId,
        },

        orderBy: {
          createdAt: "asc",
        },
      });

    return rows.map(
      SalesMapper.fromRow
    );

  }


  /*
   * ---------------------------------------------------------
   * Date-range listing
   * ---------------------------------------------------------
   */

  async list(
    filters: SalesListFilters = {}
  ): Promise<Sales[]> {

    const where:
      Prisma.SaleWhereInput = {};

    if (filters.businessId) {

      where.businessId =
        filters.businessId;

    }

    if (filters.branchId) {

      where.branchId =
        filters.branchId;

    }

    if (filters.productId) {

      where.productId =
        filters.productId;

    }

    if (filters.status) {

      where.status =
        filters.status;

    }

    if (
      filters.from ||
      filters.to
    ) {

      where.createdAt = {};

      if (filters.from) {

        where.createdAt.gte =
          filters.from;

      }

      if (filters.to) {

        where.createdAt.lte =
          filters.to;

      }

    }

    const rows =
      await this.db.sale.findMany({

        where,

        orderBy: {
          createdAt: "desc",
        },

        take:
          filters.limit ?? 100,

        skip:
          filters.offset ?? 0,

      });

    return rows.map(
      SalesMapper.fromRow
    );

  }


  /*
   * ---------------------------------------------------------
   * Summary
   * ---------------------------------------------------------
   */

  async summary(
    filters: {
      businessId?: string;
      branchId?: string;
      from?: Date;
      to?: Date;
    } = {}
  ): Promise<SalesSummaryRow> {

    const where:
      Prisma.SaleWhereInput = {};

    if (filters.businessId) {

      where.businessId =
        filters.businessId;

    }

    if (filters.branchId) {

      where.branchId =
        filters.branchId;

    }

    if (
      filters.from ||
      filters.to
    ) {

      where.createdAt = {};

      if (filters.from) {

        where.createdAt.gte =
          filters.from;

      }

      if (filters.to) {

        where.createdAt.lte =
          filters.to;

      }

    }


    const rows =
      await this.db.sale.findMany({
        where,
      });


    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalQuantity = 0;

    let transactionCount = 0;
    let voidedCount = 0;
    let refundedAmount = 0;


    for (const sale of rows) {

      if (
        sale.status === "voided"
      ) {

        voidedCount++;

        continue;

      }


      totalSales +=
        Number(sale.total);

      totalCost +=
        Number(sale.costPrice);

      totalProfit +=
        Number(sale.profit);

      totalQuantity +=
        Number(sale.quantity);

      transactionCount++;


      if (
        sale.status === "refunded"
      ) {

        refundedAmount +=
          Number(sale.total);

      }

    }


    return {
      totalSales,
      totalCost,
      totalProfit,
      totalQuantity,
      transactionCount,
      voidedCount,
      refundedAmount,
    };

  }


  /*
   * ---------------------------------------------------------
   * Update
   * ---------------------------------------------------------
   */

  async update(
    state: Sales
  ): Promise<void> {

    await this.db.sale.update({
      where: {
        id: state.id,
      },

      data:
        SalesMapper.toUpdate(state),
    });

  }


  /*
   * ---------------------------------------------------------
   * Delete
   * ---------------------------------------------------------
   */

  async delete(
    id: string
  ): Promise<void> {

    await this.db.sale.delete({
      where: {
        id,
      },
    });

  }


  /*
   * ---------------------------------------------------------
   * Get all sales
   * ---------------------------------------------------------
   */

  async getAllSales(): Promise<Sales[]> {

    const rows =
      await this.db.sale.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return rows.map(
      SalesMapper.fromRow
    );

  }

}


/*
 * ============================================================
 * Mapper
 * ============================================================
 */

export class SalesMapper {


  static toCreateInput(
    sale: Sales
  ): Prisma.SaleCreateInput {

    return {

      id:
        sale.id,

      business: {
        connect: {
          id: sale.businessId!,
        },
      },

      branch:
        sale.branchId
          ? {
              connect: {
                id: sale.branchId,
              },
            }
          : undefined,

      product: {
        connect: {
          id_businessId: {
            id: sale.productId,
            businessId: sale.businessId!,
          },
        },
      },

      productName:
        sale.productName ?? null,

      quantity:
        new Prisma.Decimal(
          sale.quantity
        ),

      unitCostPrice:
        new Prisma.Decimal(
          sale.unitCostPrice
        ),

      unitPrice:
        new Prisma.Decimal(
          sale.unitPrice
        ),

      price:
        new Prisma.Decimal(
          sale.price
        ),

      costPrice:
        new Prisma.Decimal(
          sale.costPrice
        ),

      total:
        new Prisma.Decimal(
          sale.total
        ),

      profit:
        new Prisma.Decimal(
          sale.profit
        ),

      userId:
        sale.userId ?? null,

      customerId:
        sale.customerId ?? null,

      customerRef:
        sale.customerRef ?? null,

      invoiceId:
        sale.invoiceId ?? null,

      paymentMethod:
        sale.paymentMethod ?? null,

      note:
        sale.note ?? null,

      status:
        sale.status,

      saleGroupId:
        sale.saleGroupId ?? null,

      mode:
        sale.mode,

      createdAt:
        new Date(
          sale.createdAt
        ),

      updatedAt:
        new Date(
          sale.updatedAt
        ),
    };
  }


  /*
   * ---------------------------------------------------------
   * Upsert
   * ---------------------------------------------------------
   */

  static toUpsertArgs(
    sale: Sales
  ): Prisma.SaleUpsertArgs {

    return {

      where: {
        id: sale.id,
      },

      create:
        this.toCreateInput(
          sale
        ),

      update:
        this.toUpdate(
          sale
        ),

    };

  }


  /*
   * ---------------------------------------------------------
   * Update
   * ---------------------------------------------------------
   */

  static toUpdate(
    sale: Sales
  ): Prisma.SaleUpdateInput {

    return {

      productName:
        sale.productName ?? null,

      quantity:
        new Prisma.Decimal(
          sale.quantity
        ),

      unitCostPrice:
        new Prisma.Decimal(
          sale.unitCostPrice
        ),

      unitPrice:
        new Prisma.Decimal(
          sale.unitPrice
        ),

      price:
        new Prisma.Decimal(
          sale.price
        ),

      costPrice:
        new Prisma.Decimal(
          sale.costPrice
        ),

      total:
        new Prisma.Decimal(
          sale.total
        ),

      profit:
        new Prisma.Decimal(
          sale.profit
        ),

      userId:
        sale.userId ?? null,

      customerId:
        sale.customerId ?? null,

      customerRef:
        sale.customerRef ?? null,

      invoiceId:
        sale.invoiceId ?? null,

      paymentMethod:
        sale.paymentMethod ?? null,

      note:
        sale.note ?? null,

      status:
        sale.status,

      saleGroupId:
        sale.saleGroupId ?? null,

      mode:
        sale.mode,

      updatedAt:
        new Date(
          sale.updatedAt
        ),

    };

  }


  /*
   * ---------------------------------------------------------
   * Prisma -> Shared Domain
   * ---------------------------------------------------------
   */

  static fromRow(
    row: Sale
  ): Sales {

    return {

      id:
        row.id,

      businessId:
        row.businessId,

      branchId:
        row.branchId ?? undefined,

      productId:
        row.productId,

      productName:
        row.productName ?? undefined,

      quantity:
        Number(row.quantity),

      unitCostPrice:
        Number(row.unitCostPrice),

      unitPrice:
        Number(row.unitPrice),

      price:
        Number(row.price),

      costPrice:
        Number(row.costPrice),

      total:
        Number(row.total),

      profit:
        Number(row.profit),

      userId:
        row.userId ?? undefined,

      customerId:
        row.customerId ?? undefined,

      customerRef:
        row.customerRef ?? undefined,

      invoiceId:
        row.invoiceId ?? undefined,

      paymentMethod:
        row.paymentMethod as PaymentMethod
          | undefined,

      note:
        row.note ?? undefined,

      status:
        row.status as SaleStatus,

      saleGroupId:
        row.saleGroupId ?? undefined,

      mode:
        row.mode as Mode,

      createdAt:
        row.createdAt.getTime(),

      updatedAt:
        row.updatedAt.getTime(),

    };

  }

}