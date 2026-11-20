
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

import FounderDashboardPage from "../pages/platform/dashboard/FounderDashboardPage";
import TenantManagementPage from "../pages/platform/tenants/TenantManagementPage";
import CommercialManagementPage from "../pages/platform/commercial/CommercialManagementPage";
import EntitlementManagementPage from "../pages/platform/entitlement/EntitlementPage";

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

      {/* Platform authentication */}
      <Route
        path="login"
        element={<PlatformLoginPage />}
      />

      {/* ============================================================ */}
      {/* PROTECTED COMMAND CENTRE                                     */}
      {/* ============================================================ */}

      <Route
        element={<CommandShell />}
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
        {/* FOUNDER DASHBOARD                                           */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="dashboard"
          element={
            <PlatformAuthGuard
              permissions={[
                "platform:dashboard:read",
              ]}
              context="PLATFORM"
            >
              <FounderDashboardPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* TENANT MANAGEMENT                                           */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="tenants"
          element={
            <PlatformAuthGuard
              permissions={[
                "tenant:read",
              ]}
              context="TENANT_MANAGEMENT"
            >
              <TenantManagementPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* COMMERCIAL MANAGEMENT                                       */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="commercial"
          element={
            <PlatformAuthGuard
              permissions={[
                "commercial:read",
              ]}
              context="COMMERCIAL"
            >
              <CommercialManagementPage />
            </PlatformAuthGuard>
          }
        />

        {/* ---------------------------------------------------------- */}
        {/* ENTITLEMENT MANAGEMENT                                      */}
        {/* ---------------------------------------------------------- */}

        <Route
          path="entitlements"
          element={
            <PlatformAuthGuard
              permissions={[
                "entitlement:read",
              ]}
              context="ENTITLEMENTS"
            >
              <EntitlementManagementPage />
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
