
import * as SQL from "./sql";

import type { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition";

import { billingKeys } from "./billingKeys";

export const BillingStatementDefinition: StatementDefinition[] = [

    /* ============================================================ */
    /* PLANS                                                        */
    /* ============================================================ */

    {
        key: billingKeys.planUpsert,
        sql: SQL.BILLING_PLAN_UPSERT,
    },
    {
        key: billingKeys.planFindById,
        sql: SQL.BILLING_PLAN_FIND_BY_ID,
    },
    {
        key: billingKeys.planFindByCode,
        sql: SQL.BILLING_PLAN_FIND_BY_CODE,
    },
    {
        key: billingKeys.planList,
        sql: SQL.BILLING_PLAN_LIST,
    },

    /* ============================================================ */
    /* PLAN VERSIONS                                                */
    /* ============================================================ */

    {
        key: billingKeys.planVersionUpsert,
        sql: SQL.BILLING_PLAN_VERSION_UPSERT,
    },
    {
        key: billingKeys.planVersionFindById,
        sql: SQL.BILLING_PLAN_VERSION_FIND_BY_ID,
    },
    {
        key: billingKeys.planVersionFindByNumber,
        sql: SQL.BILLING_PLAN_VERSION_FIND_BY_NUMBER,
    },
    {
        key: billingKeys.planVersionList,
        sql: SQL.BILLING_PLAN_VERSION_LIST,
    },

    /* ============================================================ */
    /* SUBSCRIPTIONS                                                */
    /* ============================================================ */

    {
        key: billingKeys.subscriptionUpsert,
        sql: SQL.BILLING_SUBSCRIPTION_UPSERT,
    },
    {
        key: billingKeys.subscriptionFindById,
        sql: SQL.BILLING_SUBSCRIPTION_FIND_BY_ID,
    },
    {
        key: billingKeys.subscriptionFindByBusiness,
        sql: SQL.BILLING_SUBSCRIPTION_FIND_BY_BUSINESS,
    },
    {
        key: billingKeys.subscriptionList,
        sql: SQL.BILLING_SUBSCRIPTION_LIST,
    },

    /* ============================================================ */
    /* ENTITLEMENTS                                                 */
    /* ============================================================ */

    {
        key: billingKeys.entitlementUpsert,
        sql: SQL.BILLING_ENTITLEMENT_UPSERT,
    },
    {
        key: billingKeys.entitlementFindById,
        sql: SQL.BILLING_ENTITLEMENT_FIND_BY_ID,
    },
    {
        key: billingKeys.entitlementFindByKey,
        sql: SQL.BILLING_ENTITLEMENT_FIND_BY_KEY,
    },
    {
        key: billingKeys.entitlementList,
        sql: SQL.BILLING_ENTITLEMENT_LIST,
    },

    /* ============================================================ */
    /* ENTITLEMENT OVERRIDES                                        */
    /* ============================================================ */

    {
        key: billingKeys.entitlementOverrideUpsert,
        sql: SQL.BILLING_ENTITLEMENT_OVERRIDE_UPSERT,
    },
    {
        key: billingKeys.entitlementOverrideFindById,
        sql: SQL.BILLING_ENTITLEMENT_OVERRIDE_FIND_BY_ID,
    },
    {
        key: billingKeys.entitlementOverrideList,
        sql: SQL.BILLING_ENTITLEMENT_OVERRIDE_LIST,
    },

    /* ============================================================ */
    /* INVOICES                                                     */
    /* ============================================================ */

    {
        key: billingKeys.invoiceUpsert,
        sql: SQL.BILLING_INVOICE_UPSERT,
    },
    {
        key: billingKeys.invoiceFindById,
        sql: SQL.BILLING_INVOICE_FIND_BY_ID,
    },
    {
        key: billingKeys.invoiceFindByNumber,
        sql: SQL.BILLING_INVOICE_FIND_BY_NUMBER,
    },
    {
        key: billingKeys.invoiceList,
        sql: SQL.BILLING_INVOICE_LIST,
    },
    {
        key: billingKeys.invoiceListBySubscription,
        sql: SQL.BILLING_INVOICE_LIST_BY_SUBSCRIPTION,
    },

    /* ============================================================ */
    /* PAYMENTS                                                     */
    /* ============================================================ */

    {
        key: billingKeys.paymentUpsert,
        sql: SQL.BILLING_PAYMENT_UPSERT,
    },
    {
        key: billingKeys.paymentFindById,
        sql: SQL.BILLING_PAYMENT_FIND_BY_ID,
    },
    {
        key: billingKeys.paymentFindByProviderReference,
        sql: SQL.BILLING_PAYMENT_FIND_BY_PROVIDER_REFERENCE,
    },
    {
        key: billingKeys.paymentList,
        sql: SQL.BILLING_PAYMENT_LIST,
    },
    {
        key: billingKeys.paymentListByInvoice,
        sql: SQL.BILLING_PAYMENT_LIST_BY_INVOICE,
    },

    /* ============================================================ */
    /* SUBSCRIPTION REQUESTS                                        */
    /* ============================================================ */

    {
        key: billingKeys.subscriptionRequestUpsert,
        sql: SQL.BILLING_SUBSCRIPTION_REQUEST_UPSERT,
    },
    {
        key: billingKeys.subscriptionRequestFindById,
        sql: SQL.BILLING_SUBSCRIPTION_REQUEST_FIND_BY_ID,
    },
    {
        key: billingKeys.subscriptionRequestList,
        sql: SQL.BILLING_SUBSCRIPTION_REQUEST_LIST,
    },

    /* ============================================================ */
    /* SUBSCRIPTION LEASES                                          */
    /* ============================================================ */

    {
        key: billingKeys.subscriptionLeaseUpsert,
        sql: SQL.BILLING_SUBSCRIPTION_LEASE_UPSERT,
    },
    {
        key: billingKeys.subscriptionLeaseFindById,
        sql: SQL.BILLING_SUBSCRIPTION_LEASE_FIND_BY_ID,
    },
    {
        key: billingKeys.subscriptionLeaseFindByDevice,
        sql: SQL.BILLING_SUBSCRIPTION_LEASE_FIND_BY_DEVICE,
    },
    {
        key: billingKeys.subscriptionLeaseList,
        sql: SQL.BILLING_SUBSCRIPTION_LEASE_LIST,
    },

];
