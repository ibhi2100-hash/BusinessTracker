
import { Routes, Route } from "react-router-dom";

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
import AddBranchPage from "./pages/owner/AddBranchPage";

/* ------------------------------------------------------------------ */
/* BRANCH INITIALIZATION                                              */
/* ------------------------------------------------------------------ */

import BranchProductAllocationPage from "./pages/branches/BranchProductAllocationPage";

/* ------------------------------------------------------------------ */
/* SALES AND OPERATIONS                                               */
/* ------------------------------------------------------------------ */

import SalesPage from "./pages/SalesPage";
import ListSalesPage from "./pages/SalesList";
import InventoriesPage from "./pages/InventoryPage";
import AnalysisBuyPage from "./pages/BuyingAnalysis";

import OwnerBranchInventoryPage from "./pages/owner/OwnerBranchInventoryPage";
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

import { AuthGuard } from "./hooks/useAuthGuard";

import { AppShell } from "./components/layout/AppShell";
import { ApplicationShell } from "./components/layout/ApplicatonShell";

import {
  RoleHomeRedirect,
} from "./components/navigation/RoleHomeRedirect";

import NotFoundPage from "./pages/NotFoundPage";
import OwnerBranchSalesPage from "./pages/owner/OwnerSalesPage";
import BranchesPage from "./components/BusinessDashboard/control/BranchesPage";
import BranchControlRoomPage from "./pages/owner/BranchControlRoomPage";

/* ------------------------------------------------------------------ */
/* ROUTER                                                             */
/* ------------------------------------------------------------------ */

export function AppRouter() {
  return (
    <Routes>

      {/* ============================================================ */}
      {/* PUBLIC ROUTES                                                */}
      {/* ============================================================ */}

      <Route path="/" element={<HomePage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/employee-signup"
        element={<EmployeeSignupPage />}
      />

      {/* ============================================================ */}
      {/* AUTHENTICATED — BUSINESS NOT REQUIRED                        */}
      {/* ============================================================ */}

      <Route element={<AuthGuard requireAuth />}>
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
            context={{ type: "BUSINESS" }}
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
            context={{ type: "BUSINESS" }}
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
                  roles={["CEO", "ADMIN"]}
                  context={{ type: "BUSINESS" }}
                />
              }
            >

              {/* OWNER DASHBOARD */}

              <Route
                path="/owner-dashboard"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={["business:read"]}
                    context={{ type: "BUSINESS" }}
                  >
                    <OwnerDashboardPage />
                  </AuthGuard>
                }
              />

              <Route
                path="/owner/branches"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={["business:read"]}
                    context={{ type: "BUSINESS" }}
                  >
                    <BranchesPage />
                  </AuthGuard>
                }
              />

              {/* ADD BUSINESS BRANCH */}

              <Route
                path="/owner/branches/add"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={["branch:create"]}
                    context={{ type: "BUSINESS" }}
                  >
                    <AddBranchPage />
                  </AuthGuard>
                }
              />

              {/* OWNER VIEW OF A SELECTED BRANCH'S INVENTORY */}

              <Route
                path="/owner/branches/:branchId/inventory"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={["inventory:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <OwnerBranchInventoryPage />
                  </AuthGuard>
                }
              />

              <Route
                path="/owner/branches/:branchId/sales"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={["sales:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <OwnerBranchSalesPage />
                  </AuthGuard>
                }
              />

              {/* BRANCH PRODUCT ALLOCATION / INITIALIZATION */}

              <Route
                path="/owner/branches/:branchId/products"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={["branch:initialize"]}
                    context={{ type: "BRANCH_SETUP" }}
                  >
                    <BranchProductAllocationPage />
                  </AuthGuard>
                }
              />

              
              <Route
                path="/owner/branches/:branchId/control-room"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={[
                      "business:read",
                      "branch:read",
                      "branch:manage",
                    ]}
                    context={{ type: "BRANCH_CONTROL_ROOM" }}
                  >
                    <BranchControlRoomPage />
                  </AuthGuard>
                }
              />



              {/* BILLING */}

              <Route
                path="/settings/billing"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN"]}
                    permissions={["billing:manage"]}
                    context={{ type: "BUSINESS" }}
                  >
                    <BillingManagementPage />
                  </AuthGuard>
                }
              />

            </Route>

            {/* ====================================================== */}
            {/* BRANCH OPERATIONS CONTEXT                               */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  context={{ type: "BRANCH_OPERATIONS" }}
                />
              }
            >

              {/* BRANCH DASHBOARD */}

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
                path="owner/branches/:branchId"
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

              <Route
                path="owner/branches/:branchId/dashboard"
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

              {/* TEAM MANAGEMENT */}

              <Route
                path="/settings/team"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["team:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <TeamPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/owner/branches/:branchId/settings/team"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["team:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <TeamPage />
                  </AuthGuard>
                }
              />


              <Route
                path="/team"
                element={
                  <AuthGuard
                    roles={["CEO", "MANAGER"]}
                    permissions={["team:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <TeamPage />
                  </AuthGuard>
                }
              />

              {/* INVENTORY */}

              <Route
                path="/inventory"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["inventory:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <InventoriesPage />
                  </AuthGuard>
                }
              />

              {/* SALES HISTORY */}

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
                    permissions={["sales:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <ListSalesPage />
                  </AuthGuard>
                }
              />

              {/* SALES CREATION */}

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
                    permissions={["sales:create"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <SalesPage />
                  </AuthGuard>
                }
              />

              {/* BUYING ANALYSIS */}

              <Route
                path="/sales/analysis"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["inventory:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <AnalysisBuyPage />
                  </AuthGuard>
                }
              />

              {/* CAPITAL INJECTION */}

              <Route
                path="/capital/inject"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["finance:write"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <CapitalInjectPage />
                  </AuthGuard>
                }
              />

              {/* CAPITAL WITHDRAWAL */}

              <Route
                path="/capital/withdraw"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["finance:write"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <CapitalWithdrawPage />
                  </AuthGuard>
                }
              />

              {/* EXPENSES */}

              <Route
                path="/expenses"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["finance:write"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <ExpensePage />
                  </AuthGuard>
                }
              />

              <Route
                path="/expenses/new"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["finance:write"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <ExpensePage />
                  </AuthGuard>
                }
              />

              {/* BRANCH REPORTS */}

              <Route
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["reports:read"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
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

              {/* SYNCHRONIZATION */}

              <Route
                path="/sync-management"
                element={
                  <AuthGuard
                    roles={["CEO", "ADMIN", "MANAGER"]}
                    permissions={["sync:read"]}
                    readOnlyRoles={["CEO"]}
                    context={{ type: "BRANCH_OPERATIONS" }}
                  >
                    <SyncMgtpage />
                  </AuthGuard>
                }
              />

            </Route>

            {/* ====================================================== */}
            {/* BUSINESS REPORT                                        */}
            {/* ====================================================== */}

            <Route
              path="/reports/business"
              element={
                <AuthGuard
                  roles={["CEO", "ADMIN"]}
                  permissions={["business:read"]}
                  context={{ type: "BUSINESS" }}
                >
                  <BusinessReportPage />
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
