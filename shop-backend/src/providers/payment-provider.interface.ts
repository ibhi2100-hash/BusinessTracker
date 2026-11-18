import { BillingPaymentMethod, BillingProvider } from "../../generated/client";

export interface ProviderInitializePaymentInput {
  reference: string;
  amountMinor: bigint;
  currency: string;
  email: string;
  callbackUrl: string;
  paymentMethod?: BillingPaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface ProviderInitializePaymentResult {
  provider: BillingProvider;
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  rawResponse?: unknown;
}

export interface ProviderVerifyPaymentInput {
  reference: string;
}

export interface ProviderVerifyPaymentResult {
  provider: BillingProvider;
  reference: string;
  providerReference: string;
  successful: boolean;
  amountMinor: bigint;
  currency: string;
  feeMinor?: bigint;
  netAmountMinor?: bigint;
  paidAt?: Date;
  rawResponse?: unknown;
}

export interface ProviderRefundInput {
  reference: string;
  amountMinor: bigint;
  reason?: string;
}

export interface ProviderRefundResult {
  provider: BillingProvider;
  providerRefundReference: string;
  successful: boolean;
  rawResponse?: unknown;
}

export interface ProviderWebhookVerificationInput {
  rawBody: Buffer;
  signature: string | undefined;
  headers: Record<string, string | string[] | undefined>;
}

export interface ProviderWebhookVerificationResult {
  valid: boolean;
  eventId?: string;
  eventType?: string;
  payload?: unknown;
}

export interface BillingProviderAdapter {
  readonly provider: BillingProvider;

  initializePayment(
    input: ProviderInitializePaymentInput,
  ): Promise<ProviderInitializePaymentResult>;

  verifyPayment(
    input: ProviderVerifyPaymentInput,
  ): Promise<ProviderVerifyPaymentResult>;

  refundPayment(
    input: ProviderRefundInput,
  ): Promise<ProviderRefundResult>;

  verifyWebhook(
    input: ProviderWebhookVerificationInput,
  ): Promise<ProviderWebhookVerificationResult>;
}

export class BillingProviderRegistry {
  private readonly adapters = new Map<BillingProvider, BillingProviderAdapter>();

  register(adapter: BillingProviderAdapter) {
    if (this.adapters.has(adapter.provider)) {
      throw new Error(`Provider already registered: ${adapter.provider}`);
    }

    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: BillingProvider) {
    const adapter = this.adapters.get(provider);

    if (!adapter) {
      throw new Error(`No billing adapter registered for ${provider}`);
    }

    return adapter;
  }
}
