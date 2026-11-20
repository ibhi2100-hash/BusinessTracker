
// src/router/router.tsx

import {
  Routes,
  Route,
} from "react-router-dom";

import { AppRouter } from "./business.router";

import { CommandRouter } from "./command.router";

import { ApplicationProvider } from "../Biztru/services/ApplicationService/ApplicationProvider";

import { BusinessProvider } from "../Biztru/context/BusinessContext";

import { NavigationPersistence } from "../pages/NavigationPersistence";

/* ------------------------------------------------------------------ */
/* BUSINESS APPLICATION                                               */
/* ------------------------------------------------------------------ */

function BusinessApplication() {
  return (
    <ApplicationProvider>

      <BusinessProvider>

        <NavigationPersistence />

        <AppRouter />

      </BusinessProvider>

    </ApplicationProvider>
  );
}

/* ------------------------------------------------------------------ */
/* ROOT ROUTER                                                        */
/* ------------------------------------------------------------------ */

export function RootRouter() {
  return (
    <Routes>

      {/* ============================================================ */}
      {/* PLATFORM ADMINISTRATION                                      */}
      {/* ============================================================ */}

      <Route
        path="/command/*"
        element={<CommandRouter />}
      />

      {/* ============================================================ */}
      {/* CUSTOMER-FACING BUSINESS APPLICATION                         */}
      {/* ============================================================ */}

      <Route
        path="/*"
        element={<BusinessApplication />}
      />

    </Routes>
  );
}
