
import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { AppBackground } from "../layout/AppBackground";
import CommandNav from "../navigation/CommandNav";

import { usePlatformSession } from "../../Biztru/services/PlatformSession/PlatformSessionContext";

/* ------------------------------------------------------------------ */
/* COMMAND SHELL                                                      */
/* ------------------------------------------------------------------ */

export function CommandShell() {
  const {
    session,
    status,
  } = usePlatformSession();

  /* ---------------------------------------------------------------- */
  /* SESSION INITIALIZATION                                           */
  /* ---------------------------------------------------------------- */

  if (status === "INITIALIZING") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-teal-400" />

          <p className="text-sm text-white/60">
            Restoring platform session...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* AUTHENTICATION                                                   */
  /* ---------------------------------------------------------------- */

  if (
    status !== "AUTHENTICATED" ||
    !session?.user
  ) {
    return (
      <Navigate
        to="/command/login"
        replace
      />
    );
  }

  /* ---------------------------------------------------------------- */
  /* ACCOUNT STATUS                                                   */
  /* ---------------------------------------------------------------- */

  if (session.user.status !== "ACTIVE") {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  /* ---------------------------------------------------------------- */
  /* APPLICATION LAYOUT                                               */
  /* ---------------------------------------------------------------- */

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* GLOBAL APPLICATION BACKGROUND */}

      <AppBackground />

      {/* COMMAND CENTRE APPLICATION */}

      <div className="relative z-10 min-h-screen">
        {/* PLATFORM NAVIGATION */}

        <CommandNav />

        {/* COMMAND CENTRE PAGES */}

        <main className="min-h-screen min-w-0 pb-28 lg:ml-64 lg:pb-8">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
