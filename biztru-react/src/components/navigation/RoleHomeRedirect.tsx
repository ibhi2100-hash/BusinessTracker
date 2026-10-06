// src/components/navigation/RoleHomeRedirect.tsx

import { Navigate } from "react-router-dom";

import {
  useApplicationSession,
} from "../../Biztru/context/AplicationSessionContext";

import {
  getHomeRoute,
  type UserRole,
} from "../navigation/getHomeRoute";

export function RoleHomeRedirect() {
  const { session } =
    useApplicationSession();

  /* -------------------------------------------------------------- */
  /* No authenticated user                                          */
  /* -------------------------------------------------------------- */

  if (!session?.user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* -------------------------------------------------------------- */
  /* Resolve role                                                    */
  /* -------------------------------------------------------------- */

  const role: UserRole | undefined =
    session.user.role === "ADMIN" ||
    session.user.role === "STAFF"
      ? session.user.role
      : undefined;

  /* -------------------------------------------------------------- */
  /* Resolve application home                                       */
  /* -------------------------------------------------------------- */

  return (
    <Navigate
      to={getHomeRoute(role)}
      replace
    />
  );
}