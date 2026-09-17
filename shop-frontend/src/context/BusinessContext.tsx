"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";

import {
    useApplication,
} from "@/src/services/ApplicationService/ApplicationContext";

import {
    changeNotifier,
} from "@/src/offline/sqlite/businessDatabase/projections/changeNoifier";

interface BusinessContextValue {
    businessId: string | null;
    branchId: string | null;

    setBranchId: (
        branchId: string
    ) => Promise<void>;

    loading: boolean;
}

const BusinessContext =
    createContext<BusinessContextValue | null>(null);

export function BusinessProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const app = useApplication();

    const [businessId, setBusinessId] =
        useState<string | null>(null);

    const [branchId, setBranchIdState] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(true);

    const loadContext = useCallback(
        async () => {

            try {

                setLoading(true);

                const ctx =
                    await app.context.current();

                console.log(
                    "[BusinessProvider] loaded context:",
                    ctx
                );

                setBusinessId(
                    ctx.businessId ?? null
                );

                setBranchIdState(
                    ctx.branchId ?? null
                );

            } catch (error) {

                console.error(
                    "[BusinessProvider] failed to load context:",
                    error
                );

                setBusinessId(null);
                setBranchIdState(null);

            } finally {

                setLoading(false);
            }
        },
        [app]
    );

    useEffect(() => {

        void loadContext();

        const unsubscribe =
            changeNotifier.subscribe(
                (tables) => {

                    if (
                        tables.includes(
                            "application_state"
                        )
                    ) {
                        console.log(
                            "[BusinessProvider] application state changed"
                        );

                        void loadContext();
                    }
                }
            );

        return unsubscribe;

    }, [loadContext]);

    const setBranchId =
        useCallback(
            async (
                newBranchId: string
            ) => {

                await app.context.setActiveBranch(
                    newBranchId
                );

                setBranchIdState(
                    newBranchId
                );

                changeNotifier.notify([
                    "application_state",
                ]);
            },
            [app]
        );

    return (
        <BusinessContext.Provider
            value={{
                businessId,
                branchId,
                setBranchId,
                loading,
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusinessContext() {

    const ctx =
        useContext(BusinessContext);

    if (!ctx) {
        throw new Error(
            "useBusinessContext must be used inside BusinessProvider"
        );
    }

    return ctx;
}