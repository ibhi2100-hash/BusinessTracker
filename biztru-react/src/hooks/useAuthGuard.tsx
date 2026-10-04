// hooks/useAuthGuard.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import{ useApplicationSession } from "../Biztru/context/AplicationSessionContext"
interface AuthGuardProps {
    adminOnly?: boolean;
    blockIfOnboarding?: boolean;
}

export function AuthGuard({
    adminOnly = false,
    blockIfOnboarding = false,
}: AuthGuardProps) {

    const location = useLocation();
    const {
    user,
    business,
} = useApplicationSession();

    // ----------------------------------------
    // 2. Require authentication
    // ----------------------------------------

    if (!user) {
        return (
            <Navigate
                to="/"
                replace
                state={{
                    from: location,
                }}
            />
        );
    }

    // ----------------------------------------
    // 3. Role authorization
    // ----------------------------------------

    if (
        adminOnly &&
        user.role !== "ADMIN"
    ) {
        return (
            <Navigate
                to="/unauthorized"
                replace
            />
        );
    }

    // ----------------------------------------
    // 4. Onboarding restriction
    // ----------------------------------------

    if (
        blockIfOnboarding &&
        business?.isOnboarding
    ) {
        return (
            <Navigate
                to="/onboarding"
                replace
            />
        );
    }

    // ----------------------------------------
    // 5. Allow nested route
    // ----------------------------------------

    return <Outlet />;
}