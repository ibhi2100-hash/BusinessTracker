import type { Request, Response } from "express";
import { Prisma } from "../../../generated/client/index.js";
import { BillingInvoiceService } from "../services/billing-invoice.service.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    businessId?: string;
  };
}

export class BillingInvoiceController {
  constructor(
    private readonly invoiceService: BillingInvoiceService
  ) {}

  async list(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const businessId = req.user?.businessId;

      if (!businessId) {
        return res.status(400).json({
          message: "Business context is required",
        });
      }

      const requestedTake = Number(req.query.take ?? 50);
      const take = Number.isFinite(requestedTake)
        ? Math.min(Math.max(Math.floor(requestedTake), 1), 100)
        : 50;

      const invoices =
        await this.invoiceService.listInvoices(
          businessId,
          take,
          typeof req.query.cursor === "string"
            ? req.query.cursor
            : undefined
        );

      return res.status(200).json({
        invoices,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async get(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const businessId = req.user?.businessId;

      if (!businessId) {
        return res.status(400).json({
          message: "Business context is required",
        });
      }

      const invoice =
        await this.invoiceService.getInvoice(
          businessId,
          req.params.invoiceId
        );

      if (!invoice) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      return res.status(200).json({
        invoice,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createDraft(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response> {
    try {
      const businessId = req.user?.businessId;

      if (!businessId) {
        return res.status(400).json({
          message: "Business context is required",
        });
      }

      const {
        subscriptionId,
        invoiceNumber,
        currency,
        items,
        taxMinor,
        discountMinor,
        dueAt,
      } = req.body;

      if (
        !invoiceNumber ||
        !currency ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message: "Invoice number, currency and invoice items are required",
        });
      }

      const parsedItems = items.map((item: any) => {
        if (
          !item ||
          typeof item.description !== "string" ||
          !item.description.trim()
        ) {
          throw new Error("Each invoice item requires a description");
        }

        const quantity = new Prisma.Decimal(
          String(item.quantity)
        );

        const unitPriceMinor = BigInt(
          String(item.unitPriceMinor)
        );

        if (quantity.lte(0) || unitPriceMinor < 0n) {
          throw new Error("Invalid invoice item quantity or price");
        }

        return {
          description: item.description.trim(),
          quantity,
          unitPriceMinor,
        };
      });

      const invoice =
        await this.invoiceService.createDraft({
          businessId,
          subscriptionId,
          invoiceNumber,
          currency,
          items: parsedItems,
          taxMinor:
            taxMinor !== undefined
              ? BigInt(String(taxMinor))
              : undefined,
          discountMinor:
            discountMinor !== undefined
              ? BigInt(String(discountMinor))
              : undefined,
          dueAt: dueAt ? new Date(dueAt) : undefined,
        });

      return res.status(201).json({
        message: "Invoice draft created",
        invoice,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async issue(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const dueAt = req.body.dueAt
        ? new Date(req.body.dueAt)
        : undefined;

      const invoice =
        await this.invoiceService.issueInvoice(
          req.params.invoiceId,
          dueAt
        );

      return res.status(200).json({
        message: "Invoice issued successfully",
        invoice,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async void(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      if (!req.body.reason) {
        return res.status(400).json({
          message: "A reason is required to void an invoice",
        });
      }

      const invoice =
        await this.invoiceService.voidInvoice(
          req.params.invoiceId,
          req.body.reason
        );

      return res.status(200).json({
        message: "Invoice voided successfully",
        invoice,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  private handleError(
    res: Response,
    error: unknown
  ): Response {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Invoice operation failed",
    });
  }
}