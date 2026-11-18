import { createHmac, timingSafeEqual } from "node:crypto";
import {
  BillingPaymentMethod,
  BillingProvider,
} from "../../../generated/client";

import {
  BillingProviderAdapter,
  ProviderInitializePaymentInput,
  ProviderInitializePaymentResult,
  ProviderRefundInput,
  ProviderRefundResult,
  ProviderVerifyPaymentInput,
  ProviderVerifyPaymentResult,
  ProviderWebhookVerificationInput,
  ProviderWebhookVerificationResult,
} from "../billing-provider.interface";

interface PaystackConfig {
  secretKey: string;
  baseUrl?: string;
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackTransactionData {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  fees?: number | null;
  paid_at?: string | null;
  gateway_response?: string;
}

interface PaystackRefundData {
  id: number;
  status: string;
  transaction: number | string;
  amount: number;
  currency: string;
}

export class PaystackAdapter implements BillingProviderAdapter {
  readonly provider = BillingProvider.PAYSTACK;
  private readonly baseUrl: string;

  constructor(private readonly config: PaystackConfig) {
    if (!config.secretKey) {
      throw new Error("Paystack secret key is required");
    }

    this.baseUrl = config.baseUrl ?? "https://api.paystack.co";
  }

  async initializePayment(
    input: ProviderInitializePaymentInput,
  ): Promise<ProviderInitializePaymentResult> {
    const payload = {
      email: input.email,
      amount: Number(input.amountMinor),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    };

    if (!Number.isSafeInteger(payload.amount)) {
      throw new Error("Payment amount exceeds safe integer range for provider API");
    }

    const response = await this.request<PaystackInitializeData>(
      "/transaction/initialize",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    return {
      provider: this.provider,
      reference: response.data.reference,
      authorizationUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      rawResponse: response,
    };
  }

  async verifyPayment(
    input: ProviderVerifyPaymentInput,
  ): Promise<ProviderVerifyPaymentResult> {
    const response = await this.request<PaystackTransactionData>(
      `/transaction/verify/${encodeURIComponent(input.reference)}`,
      { method: "GET" },
    );

    const data = response.data;
    const amountMinor = BigInt(data.amount);

    return {
      provider: this.provider,
      reference: input.reference,
      providerReference: data.reference,
      successful: data.status === "success",
      amountMinor,
      currency: data.currency,
      feeMinor: data.fees == null ? undefined : BigInt(data.fees),
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      rawResponse: response,
    };
  }

  async refundPayment(
    input: ProviderRefundInput,
  ): Promise<ProviderRefundResult> {
    const amount = Number(input.amountMinor);

    if (!Number.isSafeInteger(amount)) {
      throw new Error("Refund amount exceeds safe integer range for provider API");
    }

    const response = await this.request<PaystackRefundData>(
      "/refund",
      {
        method: "POST",
        body: JSON.stringify({
          transaction: input.reference,
          amount,
          merchant_note: input.reason,
        }),
      },
    );

    return {
      provider: this.provider,
      providerRefundReference: String(response.data.id),
      successful:
        response.data.status === "processed" ||
        response.data.status === "pending",
      rawResponse: response,
    };
  }

  async verifyWebhook(
    input: ProviderWebhookVerificationInput,
  ): Promise<ProviderWebhookVerificationResult> {
    const signature = input.signature;

    if (!signature) return { valid: false };

    const expected = createHmac("sha512", this.config.secretKey)
      .update(input.rawBody)
      .digest();

    let received: Buffer;

    try {
      received = Buffer.from(signature, "hex");
    } catch {
      return { valid: false };
    }

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return { valid: false };
    }

    let parsed: {
      event?: string;
      data?: { id?: number | string };
    };

    try {
      parsed = JSON.parse(input.rawBody.toString("utf8"));
    } catch {
      return { valid: false };
    }

    const eventId =
      parsed.data?.id !== undefined
        ? String(parsed.data.id)
        : undefined;

    return {
      valid: true,
      eventId,
      eventType: parsed.event,
      payload: parsed,
    };
  }

  private async request<T>(
    path: string,
    init: RequestInit,
  ): Promise<PaystackResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init.headers,
      },
    });

    const body = (await response.json()) as PaystackResponse<T>;

    if (!response.ok || !body.status) {
      throw new Error(
        `Paystack request failed (${response.status}): ${body.message ?? "Unknown error"}`,
      );
    }

    return body;
  }
}
