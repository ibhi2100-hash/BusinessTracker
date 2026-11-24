import type { BillingApi } from "./billingplanApi";

export class BillingSyncService {
    private readonly billing: BillingApi
  constructor(
     billing: BillingApi
  ) {
    this.billing = billing
  }

  async synchronize(options: {
    branchId: string;
    deviceId: string;
  }) {
    return this.billing.syncBilling({
      branchId: options.branchId,
      deviceId: options.deviceId,
    });
  }

  async renewLease(options: {
    branchId: string;
    deviceId: string;
  }) {
    return this.billing.refreshLease(options);
  }
}