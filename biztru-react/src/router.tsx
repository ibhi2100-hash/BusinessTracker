
import {
  Routes,
  Route,
} from "react-router-dom";

/* ------------------------------------------------------------------ */
/* PUBLIC PAGES                                                       */
/* ------------------------------------------------------------------ */

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/Login";

import EmployeeSignupPage from "./pages/team/EmployeeSignupPage";

/* ------------------------------------------------------------------ */
/* ONBOARDING                                                         */
/* ------------------------------------------------------------------ */

import OnboardingPage from "./pages/onboarding/Onboard";
import OnboardingBusinessPage from "./pages/onboarding/BusinessOnboarding";
import OnboardingInventoryPage from "./pages/onboarding/OnboardingInventory";
import OpeningCashPage from "./pages/onboarding/OnboardingCash";

/* ------------------------------------------------------------------ */
/* DASHBOARDS                                                         */
/* ------------------------------------------------------------------ */

import DashboardPage from "./pages/Dashboard";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";

/* ------------------------------------------------------------------ */
/* SALES AND OPERATIONS                                               */
/* ------------------------------------------------------------------ */

import SalesPage from "./pages/SalesPage";
import ListSalesPage from "./pages/SalesList";
import InventoriesPage from "./pages/InventoryPage";
import AnalysisBuyPage from "./pages/BuyingAnalysis";

import CapitalInjectPage from "./pages/CapitalInject";
import CapitalWithdrawPage from "./pages/CapitalWithdraw";
import ExpensePage from "./pages/ExpensePage";

/* ------------------------------------------------------------------ */
/* REPORTS                                                            */
/* ------------------------------------------------------------------ */

import ReportsDashboardPage from "./components/reports/ReportDashboardPage";
import ComparisontReportsPage from "./pages/reports/comparison/page";
import YearlyReportsPage from "./pages/reports/yearly/page";
import BusinessReportPage from "./components/reports/BusinessReportPage";

/* ------------------------------------------------------------------ */
/* ADMINISTRATION                                                     */
/* ------------------------------------------------------------------ */

import SyncMgtpage from "./pages/sync/SyncMgtPage";
import TeamPage from "./pages/team/TeamPage";

import {
  BillingManagementPage,
} from "./components/pricing/BillingManagementPage";

/* ------------------------------------------------------------------ */
/* LAYOUT AND GUARDS                                                  */
/* ------------------------------------------------------------------ */

import {
  AuthGuard,
} from "./hooks/useAuthGuard";

import {
  AppShell,
} from "./components/layout/AppShell";

import {
  ApplicationShell,
} from "./components/layout/ApplicatonShell";

import {
  RoleHomeRedirect,
} from "./components/navigation/RoleHomeRedirect";

import NotFoundPage from "./pages/NotFoundPage";

/* ------------------------------------------------------------------ */
/* ROUTER                                                             */
/* ------------------------------------------------------------------ */

export function AppRouter() {
  return (
    <Routes>

      {/* ============================================================ */}
      {/* PUBLIC ROUTES                                                */}
      {/* ============================================================ */}

      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/employee-signup"
        element={<EmployeeSignupPage />}
      />

      {/* ============================================================ */}
      {/* AUTHENTICATED — BUSINESS NOT REQUIRED                        */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard
            requireAuth
          />
        }
      >

        <Route
          path="/onboarding-business"
          element={<OnboardingBusinessPage />}
        />

      </Route>

      {/* ============================================================ */}
      {/* BUSINESS ONBOARDING                                          */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard
            requireAuth
            requireBusiness
            requireOnboarding
            context={{
              type: "BUSINESS",
            }}
          />
        }
      >

        <Route
          path="/onboarding"
          element={<OnboardingPage />}
        />

        <Route
          path="/onboarding-inventory"
          element={<OnboardingInventoryPage />}
        />

        <Route
          path="/onboarding-opening-cash"
          element={<OpeningCashPage />}
        />

      </Route>

      {/* ============================================================ */}
      {/* AUTHENTICATED APPLICATION                                    */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard
            requireAuth
            requireBusiness
            blockIfOnboarding
            context={{
              type: "BUSINESS",
            }}
          />
        }
      >

        <Route element={<AppShell />}>

          <Route element={<ApplicationShell />}>

            {/* ====================================================== */}
            {/* APPLICATION ENTRY                                      */}
            {/* ====================================================== */}

            <Route
              path="/app"
              element={<RoleHomeRedirect />}
            />

            {/* ====================================================== */}
            {/* BUSINESS ADMINISTRATION                                */}
            {/* CEO + ADMIN                                            */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  roles={[
                    "CEO",
                    "ADMIN",
                  ]}
                  context={{
                    type: "BUSINESS",
                  }}
                />
              }
            >

              {/* OWNER DASHBOARD */}

              <Route
                path="/owner-dashboard"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                    ]}
                    permissions={[
                      "business:read",
                    ]}
                    context={{
                      type: "BUSINESS",
                    }}
                  >
                    <OwnerDashboardPage />
                  </AuthGuard>
                }
              />

              {/* TEAM MANAGEMENT */}

              <Route
                path="/settings/team"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                    ]}
                    permissions={[
                      "team:manage",
                    ]}
                    context={{
                      type: "BUSINESS",
                    }}
                  >
                    <TeamPage />
                  </AuthGuard>
                }
              />

              {/* BILLING */}

              <Route
                path="/settings/billing"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                    ]}
                    permissions={[
                      "billing:manage",
                    ]}
                    context={{
                      type: "BUSINESS",
                    }}
                  >
                    <BillingManagementPage />
                  </AuthGuard>
                }
              />

            </Route>

            {/* ====================================================== */}
            {/* BRANCH OPERATIONS CONTEXT                               */}
            {/*                                                         */}
            {/* IMPORTANT:                                             */}
            {/* No role restriction at this parent level.              */}
            {/* Each individual route controls its own access.         */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  context={{
                    type: "BRANCH_OPERATIONS",
                  }}
                />
              }
            >

              {/* -------------------------------------------------- */}
              {/* BRANCH DASHBOARD                                    */}
              {/* CEO + ADMIN + MANAGER                               */}
              {/* -------------------------------------------------- */}

              {/* NORMAL BRANCH DASHBOARD */}
                <Route
                  path="/dashboard"
                  element={
                    <AuthGuard
                      roles={["CEO", "ADMIN", "MANAGER"]}
                      permissions={["branch:read"]}
                      context={{ type: "BRANCH_OPERATIONS" }}
                    >
                      <DashboardPage />
                    </AuthGuard>
                  }
                />

                {/* OWNER-SELECTED BRANCH DASHBOARD */}
                <Route
                  path="/branch/:branchId"
                  element={
                    <AuthGuard
                      roles={["CEO", "ADMIN", "MANAGER"]}
                      permissions={["branch:read"]}
                      context={{ type: "BRANCH_OPERATIONS" }}
                    >
                      <DashboardPage />
                    </AuthGuard>
                  }
                />

              {/* -------------------------------------------------- */}
              {/* INVENTORY                                           */}
              {/* CEO + ADMIN + MANAGER                               */}
              {/* -------------------------------------------------- */}

              <Route
                path="/inventory"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                    ]}
                    permissions={[
                      "inventory:read",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <InventoriesPage />
                  </AuthGuard>
                }
              />

              {/* -------------------------------------------------- */}
              {/* SALES HISTORY                                       */}
              {/* CEO + ADMIN + MANAGER + STAFF + SALES_REPS          */}
              {/* -------------------------------------------------- */}

              <Route
                path="/sales/list"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                      "STAFF",
                      "SALES_REPS",
                    ]}
                    permissions={[
                      "sales:read",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <ListSalesPage />
                  </AuthGuard>
                }
              />

              {/* -------------------------------------------------- */}
              {/* SALES CREATION                                      */}
              {/* CEO + ADMIN + MANAGER + STAFF + SALES_REPS          */}
              {/* -------------------------------------------------- */}

              <Route
                path="/sales"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                      "STAFF",
                      "SALES_REPS",
                    ]}
                    permissions={[
                      "sales:create",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <SalesPage />
                  </AuthGuard>
                }
              />

              {/* -------------------------------------------------- */}
              {/* BUYING ANALYSIS                                     */}
              {/* CEO + ADMIN + MANAGER                               */}
              {/* -------------------------------------------------- */}

              <Route
                path="/sales/analysis"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                    ]}
                    permissions={[
                      "inventory:read",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <AnalysisBuyPage />
                  </AuthGuard>
                }
              />

              {/* -------------------------------------------------- */}
              {/* CAPITAL INJECTION                                   */}
              {/* CEO + ADMIN + MANAGER                               */}
              {/* -------------------------------------------------- */}

              <Route
                path="/capital/inject"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                    ]}
                    permissions={[
                      "finance:write",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <CapitalInjectPage />
                  </AuthGuard>
                }
              />

              {/* -------------------------------------------------- */}
              {/* CAPITAL WITHDRAWAL                                  */}
              {/* CEO + ADMIN + MANAGER                               */}
              {/* -------------------------------------------------- */}

              <Route
                path="/capital/withdraw"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                    ]}
                    permissions={[
                      "finance:write",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <CapitalWithdrawPage />
                  </AuthGuard>
                }
              />

              {/* -------------------------------------------------- */}
              {/* EXPENSES                                            */}
              {/* CEO + ADMIN + MANAGER                               */}
              {/* -------------------------------------------------- */}

              <Route
                path="/expenses"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                    ]}
                    permissions={[
                      "finance:write",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <ExpensePage />
                  </AuthGuard>
                }
              />

              <Route
                path="/expenses/new"
                element={
                  <AuthGuard
                    roles={[
                      "CEO",
                      "ADMIN",
                      "MANAGER",
                    ]}
                    permissions={[
                      "finance:write",
                    ]}
                    context={{
                      type: "BRANCH_OPERATIONS",
                    }}
                  >
                    <ExpensePage />
                  </AuthGuard>
                }
              />

            </Route>

            {/* ====================================================== */}
            {/* BRANCH REPORTS                                         */}
            {/* CEO + ADMIN + MANAGER                                  */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  roles={[
                    "CEO",
                    "ADMIN",
                    "MANAGER",
                  ]}
                  permissions={[
                    "reports:read",
                  ]}
                  context={{
                    type: "BRANCH_OPERATIONS",
                  }}
                />
              }
            >

              <Route
                path="/reports"
                element={<ReportsDashboardPage />}
              />

              <Route
                path="/reports/comparison"
                element={<ComparisontReportsPage />}
              />

              <Route
                path="/reports/yearly"
                element={<YearlyReportsPage />}
              />

            </Route>

            {/* ====================================================== */}
            {/* BUSINESS REPORT                                        */}
            {/* CEO + ADMIN                                            */}
            {/* ====================================================== */}

            <Route
              path="/reports/business"
              element={
                <AuthGuard
                  roles={[
                    "CEO",
                    "ADMIN",
                  ]}
                  permissions={[
                    "business:read",
                  ]}
                  context={{
                    type: "BUSINESS",
                  }}
                >
                  <BusinessReportPage />
                </AuthGuard>
              }
            />

            {/* ====================================================== */}
            {/* SYNCHRONIZATION                                        */}
            {/* CEO + ADMIN + MANAGER                                  */}
            {/* CEO READ-ONLY                                          */}
            {/* ====================================================== */}

            <Route
              path="/sync-management"
              element={
                <AuthGuard
                  roles={[
                    "CEO",
                    "ADMIN",
                    "MANAGER",
                  ]}
                  permissions={[
                    "sync:read",
                  ]}
                  readOnlyRoles={[
                    "CEO",
                  ]}
                  context={{
                    type: "BRANCH_OPERATIONS",
                  }}
                >
                  <SyncMgtpage />
                </AuthGuard>
              }
            />

          </Route>
        </Route>
      </Route>

      {/* ============================================================ */}
      {/* UNAUTHORIZED                                                 */}
      {/* ============================================================ */}

      <Route
        path="/unauthorized"
        element={
          <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-center">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Access denied
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        }
      />

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
