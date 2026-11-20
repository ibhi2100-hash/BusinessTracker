
import { Outlet } from "react-router-dom";

import { AppBackground } from "../layout/AppBackground";
import CommandNav from "../navigation/CommandNav";

import { usePlatformSession } from "../../Biztru/services/PlatformSessionContext";

const MOCK_SESSION_ID = "dev-founder-session";

export function CommandShell() {
  const {
    session,
    status,
  } = usePlatformSession();

  // Prevent rendering the shell without an authenticated session.
  if (status !== "AUTHENTICATED" || !session?.user) {
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

  const { user } = session;

  const isMockSession =
    session.sessionId === MOCK_SESSION_ID;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* GLOBAL APPLICATION BACKGROUND */}

      <AppBackground />

      {/* COMMAND CENTRE APPLICATION */}

      <div className="relative z-10 min-h-screen">

        {/* DEVELOPMENT SESSION INDICATOR */}

        {isMockSession && (
          <div className="fixed right-4 top-4 z-[100] rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-amber-300 backdrop-blur-xl">
            DEVELOPMENT MOCK SESSION
          </div>
        )}

        {/* PLATFORM NAVIGATION */}

        <CommandNav
          role={user.role}
          displayName={
            user.displayName ??
            user.fullName ??
            user.email
          }
        />

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
