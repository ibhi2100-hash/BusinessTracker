
import type { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";

import { billingKeys } from "./billingKeys";

export class BillingStatement {

    private readonly manager: PreparedStatementManager;

    constructor(manager: PreparedStatementManager) {
        this.manager = manager;
    }

    /* ============================================================ */
    /* PLANS                                                        */
    /* ============================================================ */

    get planUpsert() {
        return this.manager.get(billingKeys.planUpsert);
    }

    get planFindById() {
        return this.manager.get(billingKeys.planFindById);
    }

    get planFindByCode() {
        return this.manager.get(billingKeys.planFindByCode);
    }

    get planList() {
        return this.manager.get(billingKeys.planList);
    }

    /* ============================================================ */
    /* PLAN VERSIONS                                                */
    /* ============================================================ */

    get planVersionUpsert() {
        return this.manager.get(billingKeys.planVersionUpsert);
    }

    get planVersionFindById() {
        return this.manager.get(billingKeys.planVersionFindById);
    }

    get planVersionFindByNumber() {
        return this.manager.get(billingKeys.planVersionFindByNumber);
    }

    get planVersionList() {
        return this.manager.get(billingKeys.planVersionList);
    }

    /* ============================================================ */
    /* SUBSCRIPTIONS                                                */
    /* ============================================================ */

    get subscriptionUpsert() {
        return this.manager.get(billingKeys.subscriptionUpsert);
    }

    get subscriptionFindById() {
        return this.manager.get(billingKeys.subscriptionFindById);
    }

    get subscriptionFindByBusiness() {
        return this.manager.get(billingKeys.subscriptionFindByBusiness);
    }

    get subscriptionList() {
        return this.manager.get(billingKeys.subscriptionList);
    }

    /* ============================================================ */
    /* ENTITLEMENTS                                                 */
    /* ============================================================ */

    get entitlementUpsert() {
        return this.manager.get(billingKeys.entitlementUpsert);
    }

    get entitlementFindById() {
        return this.manager.get(billingKeys.entitlementFindById);
    }

    get entitlementFindByKey() {
        return this.manager.get(billingKeys.entitlementFindByKey);
    }

    get entitlementList() {
        return this.manager.get(billingKeys.entitlementList);
    }

    /* ============================================================ */
    /* ENTITLEMENT OVERRIDES                                        */
    /* ============================================================ */

    get entitlementOverrideUpsert() {
        return this.manager.get(billingKeys.entitlementOverrideUpsert);
    }

    get entitlementOverrideFindById() {
        return this.manager.get(billingKeys.entitlementOverrideFindById);
    }

    get entitlementOverrideList() {
        return this.manager.get(billingKeys.entitlementOverrideList);
    }

    /* ============================================================ */
    /* INVOICES                                                     */
    /* ============================================================ */

    get invoiceUpsert() {
        return this.manager.get(billingKeys.invoiceUpsert);
    }

    get invoiceFindById() {
        return this.manager.get(billingKeys.invoiceFindById);
    }

    get invoiceFindByNumber() {
        return this.manager.get(billingKeys.invoiceFindByNumber);
    }

    get invoiceList() {
        return this.manager.get(billingKeys.invoiceList);
    }

    get invoiceListBySubscription() {
        return this.manager.get(billingKeys.invoiceListBySubscription);
    }

    /* ============================================================ */
    /* PAYMENTS                                                     */
    /* ============================================================ */

    get paymentUpsert() {
        return this.manager.get(billingKeys.paymentUpsert);
    }

    get paymentFindById() {
        return this.manager.get(billingKeys.paymentFindById);
    }

    get paymentFindByProviderReference() {
        return this.manager.get(billingKeys.paymentFindByProviderReference);
    }

    get paymentList() {
        return this.manager.get(billingKeys.paymentList);
    }

    get paymentListByInvoice() {
        return this.manager.get(billingKeys.paymentListByInvoice);
    }

    /* ============================================================ */
    /* SUBSCRIPTION REQUESTS                                        */
    /* ============================================================ */

    get subscriptionRequestUpsert() {
        return this.manager.get(billingKeys.subscriptionRequestUpsert);
    }

    get subscriptionRequestFindById() {
        return this.manager.get(billingKeys.subscriptionRequestFindById);
    }

    get subscriptionRequestList() {
        return this.manager.get(billingKeys.subscriptionRequestList);
    }

    /* ============================================================ */
    /* SUBSCRIPTION LEASES                                          */
    /* ============================================================ */

    get subscriptionLeaseUpsert() {
        return this.manager.get(billingKeys.subscriptionLeaseUpsert);
    }

    get subscriptionLeaseFindById() {
        return this.manager.get(billingKeys.subscriptionLeaseFindById);
    }

    get subscriptionLeaseFindByDevice() {
        return this.manager.get(billingKeys.subscriptionLeaseFindByDevice);
    }

    get subscriptionLeaseList() {
        return this.manager.get(billingKeys.subscriptionLeaseList);
    }
}
