// components/AppBootstrap.tsx

"use client";

import { useEffect } from "react";
import { initializeClientStorage } from "@/src/offline/sqlite/clientDatabase/ClientStorage";

export function AppBootstrap() {

    useEffect(() => {

        initializeClientStorage()
            .catch(console.error);

    }, []);

    return null;

}