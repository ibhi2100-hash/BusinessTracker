// src/hooks/useAuthGuard.tsx

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useApplicationSession,
} from "../Biztru/context/AplicationSessionContext";

type UserRole =
  | "ADMIN"
  | "STAFF";

interface AuthGuardProps {
  requireAuth?: boolean;
  requireBusiness?: boolean;
  blockIfOnboarding?: boolean;
  requireOnboarding?: boolean;
  roles?: UserRole[];
}

export function AuthGuard({
  requireAuth = true,
  requireBusiness = false,
  blockIfOnboarding = false,
  requireOnboarding = false,
  roles,
}: AuthGuardProps) {
  const location =
    useLocation();

  const {
    session
  } = useApplicationSession();

  /* -------------------------------------------------------------- */
  /* Authentication                                                  */
  /* -------------------------------------------------------------- */

  if (
    requireAuth &&
    !session.user
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Business                                                        */
  /* -------------------------------------------------------------- */

  if (
    requireBusiness &&
    !session.business
  ) {
    return (
      <Navigate
        to="/onboarding-business"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Onboarding required                                             */
  /* -------------------------------------------------------------- */

  if (
    requireOnboarding &&
    session.business &&
    !session.business.isOnboarding
  ) {
    return (
      <Navigate
        to="/app"
        replace
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Application blocked during onboarding                           */
  /* -------------------------------------------------------------- */

  if (
    blockIfOnboarding &&
    session.business?.isOnboarding
  ) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Role                                                             */
  /* -------------------------------------------------------------- */

  if (roles && session.user) {
    const role =
      session.user.role as UserRole;

    if (!roles.includes(role)) {
      return (
        <Navigate
          to="/unauthorized"
          replace
        />
      );
    }
  }

  return <Outlet />;
}