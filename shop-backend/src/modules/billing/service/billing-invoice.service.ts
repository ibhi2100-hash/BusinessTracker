import {
  BillingInvoiceStatus,
  Prisma,
  PrismaClient,
} from "../../generated/client";

interface InvoiceLineInput {
  description: string;
  quantity: Prisma.Decimal | string | number;
  unitPriceMinor: bigint;
  metadata?: Prisma.InputJsonValue;
}

interface CreateInvoiceInput {
  businessId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  currency: string;
  items: InvoiceLineInput[];
  taxMinor?: bigint;
  discountMinor?: bigint;
  periodStart?: Date;
  periodEnd?: Date;
  dueAt?: Date;
}

export class BillingInvoiceService {
  constructor(private readonly prisma: PrismaClient) {}

  async createDraft(input: CreateInvoiceInput) {
    if (!input.items.length) throw new Error("An invoice requires at least one item");

    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.findUnique({
        where: { id: input.businessId },
        select: { id: true },
      });

      if (!business) throw new Error("Business not found");

      if (input.subscriptionId) {
        const subscription = await tx.billingSubscription.findFirst({
          where: {
            id: input.subscriptionId,
            businessId: input.businessId,
          },
          select: { id: true },
        });

        if (!subscription) {
          throw new Error("Subscription does not belong to this business");
        }
      }

      let subtotal = 0n;

      const items = input.items.map((item) => {
        const quantity = new Prisma.Decimal(item.quantity);

        if (!quantity.isFinite() || quantity.lte(0)) {
          throw new Error("Invoice item quantity must be greater than zero");
        }

        if (item.unitPriceMinor < 0n) {
          throw new Error("Invoice item unit price cannot be negative");
        }

        const lineTotal = BigInt(
          quantity.mul(item.unitPriceMinor.toString()).toDecimalPlaces(0).toFixed(0),
        );

        subtotal += lineTotal;

        return {
          description: item.description,
          quantity,
          unitPriceMinor: item.unitPriceMinor,
          lineTotalMinor: lineTotal,
          metadata: item.metadata,
        };
      });

      const tax = input.taxMinor ?? 0n;
      const discount = input.discountMinor ?? 0n;

      if (tax < 0n || discount < 0n) {
        throw new Error("Tax and discount cannot be negative");
      }

      const total = subtotal + tax - discount;

      if (total < 0n) throw new Error("Invoice total cannot be negative");

      return tx.billingInvoice.create({
        data: {
          businessId: input.businessId,
          subscriptionId: input.subscriptionId ?? null,
          invoiceNumber: input.invoiceNumber,
          status: BillingInvoiceStatus.DRAFT,
          currency: input.currency.toUpperCase(),
          subtotalMinor: subtotal,
          taxMinor: tax,
          discountMinor: discount,
          totalMinor: total,
          amountPaidMinor: 0n,
          amountDueMinor: total,
          periodStart: input.periodStart ?? null,
          periodEnd: input.periodEnd ?? null,
          dueAt: input.dueAt ?? null,
          items: { create: items },
        },
        include: { items: true },
      });
    });
  }

  async issueInvoice(invoiceId: string, dueAt?: Date) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.billingInvoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) throw new Error("Invoice not found");

      if (invoice.status !== BillingInvoiceStatus.DRAFT) {
        throw new Error("Only draft invoices can be issued");
      }

      if (invoice.totalMinor < 0n) {
        throw new Error("Invoice total is invalid");
      }

      return tx.billingInvoice.update({
        where: { id: invoiceId },
        data: {
          status:
            invoice.totalMinor === 0n
              ? BillingInvoiceStatus.PAID
              : BillingInvoiceStatus.ISSUED,
          issuedAt: new Date(),
          dueAt: dueAt ?? invoice.dueAt,
          paidAt: invoice.totalMinor === 0n ? new Date() : null,
          amountDueMinor: invoice.totalMinor,
          aggregateVersion: { increment: 1 },
        },
      });
    });
  }

  async allocatePayment(
    paymentId: string,
    invoiceId: string,
    amountMinor: bigint,
  ) {
    if (amountMinor <= 0n) {
      throw new Error("Allocation amount must be greater than zero");
    }

    return this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.billingPayment.findUnique({
          where: { id: paymentId },
        });

        const invoice = await tx.billingInvoice.findUnique({
          where: { id: invoiceId },
        });

        if (!payment || !invoice) {
          throw new Error("Payment or invoice not found");
        }

        if (payment.businessId !== invoice.businessId) {
          throw new Error("Payment and invoice belong to different businesses");
        }

        if (payment.currency !== invoice.currency) {
          throw new Error("Payment and invoice currencies do not match");
        }

        if (payment.status !== "CONFIRMED") {
          throw new Error("Only confirmed payments can be allocated");
        }

        if (
          invoice.status === BillingInvoiceStatus.VOIDED ||
          invoice.status === BillingInvoiceStatus.CANCELLED ||
          invoice.status === BillingInvoiceStatus.DRAFT
        ) {
          throw new Error("Invoice cannot accept payment allocations");
        }

        // Locking the invoice row prevents concurrent over-allocation.
        await tx.$queryRaw`
          SELECT id FROM "BillingInvoice"
          WHERE id = ${invoiceId}
          FOR UPDATE
        `;

        const refreshedInvoice = await tx.billingInvoice.findUniqueOrThrow({
          where: { id: invoiceId },
        });

        const previousAllocations = await tx.billingPaymentAllocation.aggregate({
          where: { paymentId },
          _sum: { amountMinor: true },
        });

        const alreadyAllocated = previousAllocations._sum.amountMinor ?? 0n;
        const availablePayment = payment.amountMinor - alreadyAllocated;

        if (amountMinor > availablePayment) {
          throw new Error("Allocation exceeds the unallocated payment balance");
        }

        if (amountMinor > refreshedInvoice.amountDueMinor) {
          throw new Error("Allocation exceeds the invoice amount due");
        }

        const allocation = await tx.billingPaymentAllocation.create({
          data: {
            businessId: payment.businessId,
            paymentId,
            invoiceId,
            amountMinor,
          },
        });

        const newPaid = refreshedInvoice.amountPaidMinor + amountMinor;
        const newDue = refreshedInvoice.totalMinor - newPaid;

        if (newDue < 0n) {
          throw new Error("Invoice would become overpaid");
        }

        await tx.billingInvoice.update({
          where: { id: invoiceId },
          data: {
            amountPaidMinor: newPaid,
            amountDueMinor: newDue,
            status:
              newDue === 0n
                ? BillingInvoiceStatus.PAID
                : BillingInvoiceStatus.PARTIALLY_PAID,
            paidAt: newDue === 0n ? new Date() : null,
            aggregateVersion: { increment: 1 },
          },
        });

        return allocation;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async markOverdueInvoices(now = new Date()) {
    const result = await this.prisma.billingInvoice.updateMany({
      where: {
        status: {
          in: [
            BillingInvoiceStatus.ISSUED,
            BillingInvoiceStatus.PARTIALLY_PAID,
          ],
        },
        dueAt: { lt: now },
        amountDueMinor: { gt: 0n },
      },
      data: {
        status: BillingInvoiceStatus.OVERDUE,
        aggregateVersion: { increment: 1 },
      },
    });

    return result.count;
  }

  async voidInvoice(invoiceId: string, reason: string) {
    if (!reason.trim()) throw new Error("A void reason is required");

    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.billingInvoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) throw new Error("Invoice not found");

      if (invoice.amountPaidMinor > 0n) {
        throw new Error("An invoice with payments cannot be voided; issue a credit/refund workflow");
      }

      if (
        invoice.status === BillingInvoiceStatus.PAID ||
        invoice.status === BillingInvoiceStatus.VOIDED
      ) {
        throw new Error("Invoice cannot be voided from its current state");
      }

      const updated = await tx.billingInvoice.update({
        where: { id: invoiceId },
        data: {
          status: BillingInvoiceStatus.VOIDED,
          amountDueMinor: 0n,
          aggregateVersion: { increment: 1 },
        },
      });

      await tx.billingAuditLog.create({
        data: {
          businessId: invoice.businessId,
          action: "UPDATED",
          entityType: "BillingInvoice",
          entityId: invoice.id,
          reason: reason.trim(),
          beforeData: {
            status: invoice.status,
            amountDueMinor: invoice.amountDueMinor.toString(),
          },
          afterData: {
            status: BillingInvoiceStatus.VOIDED,
            amountDueMinor: "0",
          },
        },
      });

      return updated;
    });
  }

  async getInvoice(businessId: string, invoiceId: string) {
    return this.prisma.billingInvoice.findFirst({
      where: { id: invoiceId, businessId },
      include: {
        items: true,
        allocations: {
          include: {
            payment: true,
          },
        },
      },
    });
  }

  async listInvoices(businessId: string, take = 50, cursor?: string) {
    return this.prisma.billingInvoice.findMany({
      where: { businessId },
      take: Math.min(Math.max(take, 1), 100),
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }
}
