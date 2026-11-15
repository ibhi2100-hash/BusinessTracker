
import {
  Routes,
  Route,
} from "react-router-dom";

/* ------------------------------------------------------------------ */
/* Public pages                                                       */
/* ------------------------------------------------------------------ */

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/Login";

import EmployeeSignupPage from "./pages/team/EmployeeSignupPage";

/* ------------------------------------------------------------------ */
/* Onboarding                                                         */
/* ------------------------------------------------------------------ */

import OnboardingPage from "./pages/onboarding/Onboard";
import OnboardingBusinessPage from "./pages/onboarding/BusinessOnboarding";
import OnboardingInventoryPage from "./pages/onboarding/OnboardingInventory";
import OpeningCashPage from "./pages/onboarding/OnboardingCash";

/* ------------------------------------------------------------------ */
/* Dashboards                                                         */
/* ------------------------------------------------------------------ */

import DashboardPage from "./pages/Dashboard";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";

/* ------------------------------------------------------------------ */
/* Sales and operations                                               */
/* ------------------------------------------------------------------ */

import SalesPage from "./pages/SalesPage";
import ListSalesPage from "./pages/SalesList";
import InventoriesPage from "./pages/InventoryPage";
import AnalysisBuyPage from "./pages/BuyingAnalysis";

import CapitalInjectPage from "./pages/CapitalInject";
import CapitalWithdrawPage from "./pages/CapitalWithdraw";
import ExpensePage from "./pages/ExpensePage";

/* ------------------------------------------------------------------ */
/* Reports                                                            */
/* ------------------------------------------------------------------ */

import ReportsDashboardPage from "./components/reports/ReportDashboardPage";
import ComparisontReportsPage from "./pages/reports/comparison/page";
import YearlyReportsPage from "./pages/reports/yearly/page";
import BusinessReportPage from "./components/reports/BusinessReportPage";

/* ------------------------------------------------------------------ */
/* Administration                                                    */
/* ------------------------------------------------------------------ */

import SyncMgtpage from "./pages/sync/SyncMgtPage";
import TeamPage from "./pages/team/TeamPage";

import {
  BillingManagementPage,
} from "./components/pricing/BillingManagementPage";

/* ------------------------------------------------------------------ */
/* Layout and guards                                                  */
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
/* Router                                                             */
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
      {/* AUTHENTICATED — ONBOARDING                                   */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard
            requireAuth
            requireBusiness
            requireOnboarding
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
      {/* APPLICATION SHELL                                            */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard
            requireAuth
            requireBusiness
            blockIfOnboarding
          />
        }
      >
        <Route element={<AppShell />}>
          <Route element={<ApplicationShell />}>

            {/* ------------------------------------------------------ */}
            {/* APPLICATION ENTRY                                      */}
            {/* ------------------------------------------------------ */}

            <Route
              path="/app"
              element={<RoleHomeRedirect />}
            />

            {/* ====================================================== */}
            {/* CEO + ADMIN — OWNER WORKSPACE                           */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  roles={[
                    "CEO",
                    "ADMIN",
                  ]}
                />
              }
            >
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
                    readOnly
                  >
                    <OwnerDashboardPage />
                  </AuthGuard>
                }
              />
            </Route>

            {/* ====================================================== */}
            {/* CEO + ADMIN + MANAGER — BRANCH DASHBOARD                */}
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
                    "branch:read",
                  ]}
                  readOnlyRoles={[
                    "CEO",
                    "ADMIN",
                  ]}
                />
              }
            >
              <Route
                path="/dashboard"
                element={<DashboardPage />}
              />
            </Route>

            {/* ====================================================== */}
            {/* CEO + ADMIN + MANAGER — BRANCH SALES HISTORY            */}
            {/* ====================================================== */}

            <Route
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
                  readOnlyRoles={[
                    "CEO",
                    "ADMIN",
                  ]}
                />
              }
            >
              <Route
                path="/sales/list"
                element={<ListSalesPage />}
              />
            </Route>

            {/* ====================================================== */}
            {/* MANAGER + STAFF + SALES REPS — SALES OPERATIONS         */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  roles={[
                    "MANAGER",
                    "STAFF",
                    "SALES_REPS",
                  ]}
                  permissions={[
                    "sales:create",
                  ]}
                />
              }
            >
              <Route
                path="/sales"
                element={<SalesPage />}
              />
            </Route>

            {/* ====================================================== */}
            {/* CEO + ADMIN + MANAGER — INVENTORY VIEW                  */}
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
                    "inventory:read",
                  ]}
                  readOnlyRoles={[
                    "CEO",
                    "ADMIN",
                  ]}
                />
              }
            >
              <Route
                path="/inventory"
                element={<InventoriesPage />}
              />
            </Route>

            {/* ====================================================== */}
            {/* MANAGER — BRANCH OPERATIONS                             */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  roles={[
                    "MANAGER",
                  ]}
                  permissions={[
                    "branch:write",
                  ]}
                />
              }
            >
              {/* Buying analysis */}

              <Route
                path="/sales/analysis"
                element={<AnalysisBuyPage />}
              />

              {/* Capital management */}

              <Route
                path="/capital/inject"
                element={<CapitalInjectPage />}
              />

              <Route
                path="/capital/withdraw"
                element={<CapitalWithdrawPage />}
              />

              {/* Expenses */}

              <Route
                path="/expenses"
                element={<ExpensePage />}
              />

              <Route
                path="/expenses/new"
                element={<ExpensePage />}
              />
            </Route>

            {/* ====================================================== */}
            {/* CEO + ADMIN + MANAGER — REPORTS                         */}
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
                  readOnlyRoles={[
                    "CEO",
                    "ADMIN",
                  ]}
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
                    readOnly
                  >
                    <BusinessReportPage />
                  </AuthGuard>
                }
              />
            </Route>

            {/* ====================================================== */}
            {/* CEO + ADMIN — BUSINESS ADMINISTRATION                  */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  roles={[
                    "CEO",
                    "ADMIN",
                  ]}
                />
              }
            >
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
                  >
                    <TeamPage />
                  </AuthGuard>
                }
              />

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
                  >
                    <BillingManagementPage />
                  </AuthGuard>
                }
              />
            </Route>

            {/* ====================================================== */}
            {/* ADMIN + MANAGER — SYNCHRONIZATION                       */}
            {/* CEO can observe but cannot manage sync                  */}
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
                    "sync:read",
                  ]}
                  readOnlyRoles={[
                    "CEO",
                  ]}
                />
              }
            >
              <Route
                path="/sync-management"
                element={<SyncMgtpage />}
              />
            </Route>

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
      {/* FALLBACK                                                     */}
      {/* ============================================================ */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}
