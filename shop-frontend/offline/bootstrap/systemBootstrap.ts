"use client";

import { useEffect } from "react";

import { StorageBusCreator } from "@/src/offline/sqlite/bus/StorageBusCreator";
import { ClientDatabaseBootstrap } from "./ClientDatabaseBootstrap";
import { UserStatements } from "@/src/offline/repositories/SQLiteAuthRepository/UserStatements";
import { SQLiteAuthRepository } from "@/src/offline/sqlite/clientDatabase/repositories/SQLiteAuthRepository/SQLiteAuthRepository";
import { AuthService } from "@/src/services/authService";

export function SystemBootstrap() {

    useEffect(() => {

        async function boot() {

            const storage =
                StorageBusCreator();

            await new ClientDatabaseBootstrap(
                storage
            ).initialize();

        }

        boot();

    }, []);

    return null;

}