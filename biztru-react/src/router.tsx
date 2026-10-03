import {
    Routes,
    Route,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";

import OpeningCashPage from "./pages/onboarding/OnboardingCash";
import OnboardingPage from "./pages/onboarding/Onboard";
import OnboardingBusinessPage from "./pages/onboarding/BusinessOnboarding";
import OnboardingInventoryPage from "./pages/onboarding/OnboardingInventory";

import DashboardPage from "./pages/Dashboard";
import SalesPage from "./pages/SalesPage";
import ListSalesPage from "./pages/SalesList";
import InventoriesPage from "./pages/InventoryPage";
import AnalysisBuyPage from "./pages/BuyingAnalysis";
import CapitalInjectPage from "./pages/CapitalInject";
import CapitalWithdrawPage from "./pages/CapitalWithdraw";
import ExpensePage from "./pages/ExpensePage";

import { AuthGuard } from "./hooks/useAuthGuard"; 
import { AppShell } from "./components/layout/AppShell"; 
import { DashboardShell } from "./components/layout/DashBoardShell";
import LoginPage from "./pages/auth/Login";

export function AppRouter() {
    return (
        <Routes>

            {/* -------------------------------- */}
            {/* Public routes                    */}
            {/* -------------------------------- */}

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

            {/* -------------------------------- */}
            {/* Onboarding routes                */}
            {/* -------------------------------- */}

            <Route
                path="/onboarding-business"
                element={<OnboardingBusinessPage />}
            />

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


            {/* -------------------------------- */}
            {/* Authenticated application        */}
            {/* -------------------------------- */}

            <Route element={<AuthGuard />}>

                <Route element={<AppShell />}>

                    <Route element={<DashboardShell />}>

                        <Route
                            path="/dashboard"
                            element={<DashboardPage />}
                        />
                        <Route
                            path="/inventory"
                            element={<InventoriesPage />}
                        />
                        
                        <Route
                            path="/sales"
                            element={<SalesPage />}
                        />

                        <Route
                            path="/capital/inject"
                            element={<CapitalInjectPage />}
                        />

                        <Route
                            path="/capital/withdraw"
                            element={<CapitalWithdrawPage />}
                        />

                        <Route
                            path="/sale/list"
                            element={<ListSalesPage />}
                        />

                        <Route
                            path="/sales/ananysis"
                            element={<AnalysisBuyPage />}
                        />

                        <Route
                            path="/expense"
                            element={<ExpensePage />}
                        />


                    </Route>

                </Route>

            </Route>

        </Routes>
    );
}