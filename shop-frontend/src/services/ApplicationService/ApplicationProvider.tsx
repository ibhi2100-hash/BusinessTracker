"use client";

import {
    useEffect,
    useState,
    ReactNode
} from "react";

import Context from "./ApplicationContext";
import { ApplicationComposer } from "./ApplicationComposer"
import type { Application } from "./Application";

interface Props {
    children: ReactNode;
}

export function ApplicationProvider({
    children
}: Props) {

    const [application, setApplication] =
        useState<Application | null>(null);

    useEffect(() => {

        let mounted = true;

        async function bootstrap() {

            const app =
                await ApplicationComposer.compose();
            
            if (mounted) {
                setApplication(app);
            }
        }

        bootstrap();

        return () => {
            mounted = false;
        };

    }, []);

    if (!application) {
        return <>Loading...</>;
    }

    return (
        <Context.Provider
            value={application}
        >
            {children}
        </Context.Provider>
    );
}