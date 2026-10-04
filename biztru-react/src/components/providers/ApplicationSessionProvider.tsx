
import { ApplicationSessionContext, type ApplicationSessionState } from "../../Biztru/context/AplicationSessionContext";
interface ApplicationSessionProviderProps {
    children: React.ReactNode;

    session: ApplicationSessionState;
}

export function ApplicationSessionProvider({
    children,
    session,
}: ApplicationSessionProviderProps) {
    return (
        <ApplicationSessionContext.Provider
            value={session}
        >
            {children}
        </ApplicationSessionContext.Provider>
    );
}