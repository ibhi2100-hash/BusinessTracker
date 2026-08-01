"use client";

import { createContext, useContext } from "react";
import type { Application } from "./Application";

const Context = createContext<Application | null>(null);

export function useApplication() {
    const app = useContext(Context);

    if (!app) {
        throw new Error(
            "ApplicationProvider has not been mounted."
        );
    }

    return app;
}

export default Context;