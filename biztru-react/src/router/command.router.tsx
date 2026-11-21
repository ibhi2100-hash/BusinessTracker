
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ------------------------------------------------------------------ */
/* PUBLIC PLATFORM PAGES                                              */
/* ------------------------------------------------------------------ */

import PlatformLoginPage from "../pages/auth/platformAuth/PlatformLoginPage";

/* ------------------------------------------------------------------ */
/* PROTECTED PLATFORM PAGES                                           */
/* ------------------------------------------------------------------ */

// Dashboard
import FounderDashboardPage from "../pages/platform/dashboard/FounderDashboardPage";

// Tenant management
import TenantManagementPage from "../pages/platform/tenants/TenantManagementPage";

// Commercial management
import CommercialManagementPage from "../pages/platform/commercial/CommercialManagementPage";

// Platform entitlement management
import EntitlementManagementPage from "../pages/platform/entitlement/EntitlementPage";

/* ------------------------------------------------------------------ */
/* PLATFORM BILLING PAGES                                             */
/* ------------------------------------------------------------------ */

// Billing overview
import BillingOverviewPage from "../pages/platform/billing/BillingOverviewPage";

// Plan management
import BillingPlansPage from "../pages/platform/billing/BillingPlansPage";
import CreateBillingPlanPage from "../pages/platform/billing/CreateBillingPlanPage";
import EditBillingPlanPage from "../pages/platform/billing/EditBillingPlanPage";
import BillingPlanDetailsPage from "../pages/platform/billing/BillingPlanDetailsPage";

// Subscription management
import BillingSubscriptionsPage from "../pages/platform/billing/BillingSubscriptionsPage";
import BillingSubscriptionDetailsPage from "../pages/platform/billing/BillingSubscriptionDetailsPage";

// Billing entitlements
import BillingEntitlementsPage from "../pages/platform/billing/BillingEntitlementsPage";

// Financial operations
import BillingFinancialOperationsPage from "../pages/platform/billing/BillingFinancialOperationsPage";

// Billing events
import BillingEventsPage from "../pages/platform/billing/BillingEventsPage";

// Business catalogue synchronization
import BillingSynchronizationPage from "../pages/platform/billing/BillingSynchronizationPage";

/* ------------------------------------------------------------------ */
/* LAYOUT AND GUARDS                                                  */
/* ------------------------------------------------------------------ */

import { CommandShell } from "../components/command/CommandShell";
import { PlatformAuthGuard } from "../hooks/usePlatformAuthGuard";

/* ------------------------------------------------------------------ */
/* NOT FOUND                                                          */
/* ------------------------------------------------------------------ */

import NotFoundPage from "../pages/NotFoundPage";

/* ------------------------------------------------------------------ */
/* ROUTER                                                             */
/* ------------------------------------------------------------------ */

export function CommandRouter() {
  return (
    <Routes>
      {/* ============================================================ */}
      {/* PUBLIC ROUTES                                                */}
      {/* ============================================================ */}

      <Route
        path="login"
        element={<PlatformLoginPage />}
      />

      {/* ============================================================ */}
      {/* PROTECTED COMMAND CENTRE                                     */}
      {/* ============================================================ */}

      <Route
        element={
          <PlatformAuthGuard>
            <CommandShell />
          </PlatformAuthGuard>
        }
      >
        {/* ---------------------------------------------------------- */}
        {/* COMMAND CENTRE ENTRY                                       */}
        {/* ---------------------------------------------------------- */}

        <Route
          index
          element={
            <Navigate
              to="/command/dashboard"
              replace
            />
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* FOUNDER DASHBOARD                                          */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="dashboard"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.analytics.read",
              ]}
              context="PLATFORM"
            >
              <FounderDashboardPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* TENANT MANAGEMENT                                          */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="tenants"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.tenants.read",
              ]}
              context="TENANT_MANAGEMENT"
            >
              <TenantManagementPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* COMMERCIAL MANAGEMENT                                      */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="commercial"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.commercial.read",
              ]}
              context="COMMERCIAL"
            >
              <CommercialManagementPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* PLATFORM ENTITLEMENT MANAGEMENT                             */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="entitlements"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.entitlements.read",
              ]}
              context="ENTITLEMENTS"
            >
              <EntitlementManagementPage />
            </PlatformAuthGuard>
          }
        />

        {/* ========================================================== */}
        {/* BILLING MANAGEMENT                                         */}
        {/* ========================================================== */}

        {/* ---------------------------------------------------------- */}
        {/* BILLING OVERVIEW                                           */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="billing"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.read",
              ]}
              context="BILLING"
            >
              <BillingOverviewPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* BILLING PLAN CATALOGUE                                     */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="billing/plans"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.plans.read",
              ]}
              context="BILLING"
            >
              <BillingPlansPage />
            </PlatformAuthGuard>
          }
        />

        {/* CREATE BILLING PLAN */}

        <Route
          path="billing/plans/create"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.plans.create",
              ]}
              context="BILLING"
            >
              <CreateBillingPlanPage />
            </PlatformAuthGuard>
          }
        />

        {/* VIEW BILLING PLAN */}

        <Route
          path="billing/plans/:planId"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.plans.read",
              ]}
              context="BILLING"
            >
              <BillingPlanDetailsPage />
            </PlatformAuthGuard>
          }
        />

        {/* EDIT BILLING PLAN */}

        <Route
          path="billing/plans/:planId/edit"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.plans.update",
              ]}
              context="BILLING"
            >
              <EditBillingPlanPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* SUBSCRIPTION MANAGEMENT                                    */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="billing/subscriptions"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.subscriptions.read",
              ]}
              context="BILLING"
            >
              <BillingSubscriptionsPage />
            </PlatformAuthGuard>
          }
        />

        {/* SUBSCRIPTION DETAILS */}

        <Route
          path="billing/subscriptions/:subscriptionId"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.subscriptions.read",
              ]}
              context="BILLING"
            >
              <BillingSubscriptionDetailsPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* BILLING ENTITLEMENTS                                       */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="billing/entitlements"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.entitlements.read",
              ]}
              context="BILLING"
            >
              <BillingEntitlementsPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* FINANCIAL OPERATIONS                                       */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="billing/financial"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.financial.read",
              ]}
              context="BILLING"
            >
              <BillingFinancialOperationsPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* BILLING EVENT HISTORY                                      */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="billing/events"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.events.read",
              ]}
              context="BILLING"
            >
              <BillingEventsPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* BUSINESS BILLING SYNCHRONIZATION                           */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="billing/synchronization"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform.billing.synchronization.read",
              ]}
              context="BILLING"
            >
              <BillingSynchronizationPage />
            </PlatformAuthGuard>
          }
        />
      </Route>

      {/* ============================================================ */}
      {/* NOT FOUND                                                    */}
      {/* ============================================================ */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}
