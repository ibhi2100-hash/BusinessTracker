// src/router.tsx

import {
  Routes,
  Route,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/Login";

import OnboardingPage from "./pages/onboarding/Onboard";
import OnboardingBusinessPage from "./pages/onboarding/BusinessOnboarding";
import OnboardingInventoryPage from "./pages/onboarding/OnboardingInventory";
import OpeningCashPage from "./pages/onboarding/OnboardingCash";

import DashboardPage from "./pages/Dashboard";
import SalesPage from "./pages/SalesPage";
import ListSalesPage from "./pages/SalesList";
import InventoriesPage from "./pages/InventoryPage";
import AnalysisBuyPage from "./pages/BuyingAnalysis";
import CapitalInjectPage from "./pages/CapitalInject";
import CapitalWithdrawPage from "./pages/CapitalWithdraw";
import ExpensePage from "./pages/ExpensePage";

import ReportsDashboardPage from "./components/reports/ReportDashboardPage";
import ComparisontReportsPage from "./pages/reports/comparison/page";
import YearlyReportsPage from "./pages/reports/yearly/page";

import SyncMgtpage from "./pages/sync/SyncMgtPage";

import {
  AuthGuard,
} from "./hooks/useAuthGuard";

import {
  AppShell,
} from "./components/layout/AppShell";

import { ApplicationShell } from "./components/layout/ApplicatonShell";

import {
  RoleHomeRedirect,
} from "./components/navigation/RoleHomeRedirect";
import TeamPage from "./pages/team/TeamPage";

/* ------------------------------------------------------------------ */
/* Router                                                             */
/* ------------------------------------------------------------------ */

export function AppRouter() {
  return (
    <Routes>

      {/* ============================================================ */}
      {/* PUBLIC                                                        */}
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

      {/* ============================================================ */}
      {/* AUTHENTICATED — NO BUSINESS REQUIRED                         */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard />
        }
      >
        <Route
          path="/onboarding-business"
          element={
            <OnboardingBusinessPage />
          }
        />
      </Route>

      {/* ============================================================ */}
      {/* AUTHENTICATED + BUSINESS                                     */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard
            requireBusiness
            requireOnboarding
          />
        }
      >
        <Route
          path="/onboarding"
          element={
            <OnboardingPage />
          }
        />

        <Route
          path="/onboarding-inventory"
          element={
            <OnboardingInventoryPage />
          }
        />

        <Route
          path="/onboarding-opening-cash"
          element={
            <OpeningCashPage />
          }
        />
      </Route>

      {/* ============================================================ */}
      {/* APPLICATION                                                  */}
      {/* ============================================================ */}

      <Route
        element={
          <AuthGuard
            requireBusiness
            blockIfOnboarding
          />
        }
      >
        <Route
          element={<AppShell />}
        >
          <Route
            element={
              <ApplicationShell />
            }
          >

            {/* ------------------------------------------------------ */}
            {/* Canonical application entry                           */}
            {/* ------------------------------------------------------ */}

            <Route
              path="/app"
              element={
                <RoleHomeRedirect />
              }
            />

            {/* ====================================================== */}
            {/* STAFF + ADMIN                                         */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  requireBusiness
                  blockIfOnboarding
                  roles={[
                    "ADMIN",
                    "STAFF",
                  ]}
                />
              }
            >
              <Route
                path="/sales"
                element={
                  <SalesPage />
                }
              />

              <Route
                path="/sales/list"
                element={
                  <ListSalesPage />
                }
              />
            </Route>

            {/* ====================================================== */}
            {/* ADMIN ONLY                                             */}
            {/* ====================================================== */}

            <Route
              element={
                <AuthGuard
                  requireBusiness
                  blockIfOnboarding
                  roles={[
                    "ADMIN",
                  ]}
                />
              }
            >
              <Route
                path="/dashboard"
                element={
                  <DashboardPage />
                }
              />
              <Route
                path="/settings/team"
                element={<TeamPage />}
                />

              <Route
                path="/inventory"
                element={
                  <InventoriesPage />
                }
              />

              <Route
                path="/sales/analysis"
                element={
                  <AnalysisBuyPage />
                }
              />

              <Route
                path="/capital/inject"
                element={
                  <CapitalInjectPage />
                }
              />

              <Route
                path="/capital/withdraw"
                element={
                  <CapitalWithdrawPage />
                }
              />

              <Route
                path="/expenses"
                element={
                  <ExpensePage />
                }
              />

              <Route
                path="/expenses/new"
                element={
                  <ExpensePage />
                }
              />

              <Route
                path="/reports"
                element={
                  <ReportsDashboardPage />
                }
              />

              <Route
                path="/reports/comparison"
                element={
                  <ComparisontReportsPage />
                }
              />

              <Route
                path="/reports/yearly"
                element={
                  <YearlyReportsPage />
                }
              />

              <Route
                path="/sync-management"
                element={
                  <SyncMgtpage />
                }
              />
            </Route>

          </Route>
        </Route>
      </Route>

      {/* ============================================================ */}
      {/* FALLBACK                                                     */}
      {/* ============================================================ */}

      <Route
        path="*"
        element={
          <RoleHomeRedirect />
        }
      />

    </Routes>
  );
}