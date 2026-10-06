import {
    ApplicationSessionContext,
    type ApplicationSessionState,
} from "../../Biztru/context/AplicationSessionContext";


interface ApplicationSessionProviderProps {

    children: React.ReactNode;

    session: ApplicationSessionState;

    refreshSession: () => Promise<ApplicationSessionState>;
}


export function ApplicationSessionProvider({
    children,
    session,
    refreshSession,
}: ApplicationSessionProviderProps) {

    return (
        <ApplicationSessionContext.Provider
            value={{
                session,
                refreshSession,
            }}
        >
            {children}
        </ApplicationSessionContext.Provider>
    );
}