// SQLiteBootstrap.tsx

"use client";

import { useEffect } from "react";
import { StorageBusCreator } from "@/src/offline/sqlite/bus/StorageBusCreator";
import { ClientDatabaseBootstrap } from "./ClientDatabaseBootstrap";

export function SQLiteBootstrap() {

    useEffect(() => {

    const bootstrap = new ClientDatabaseBootstrap(
        StorageBusCreator()
    );

    let disposed = false;

    (async () => {
        if (!disposed) {
            await bootstrap.initialize();
        }
    })();

    return () => {
        disposed = true;
    };

}, []);

    return null;

}