// src/offline/sqlite/client/ClientDatabase.ts

import { IStorageContext } from "../types/IStorageContext";
import { ClientConnection } from "./ClientConnection";
import { ClientSession }  from "../worker/sessions/ClientStorageSession"

export class ClientSessionManager {

    private static instance: ClientSessionManager;

    readonly connection: ClientConnection;

   constructor(
        private clientSession: ClientSession
   ){}

   async initialize(): Promise<void> {

        if (this.clientSession) {
            await this.clientSession.initialize();
        }
    }

    async query(sql: string, params?: any[]): Promise<any> {

        if (!this.clientSession) {
            throw new Error("Client session is not initialized.");
        }

        return await this.clientSession.query(sql, params);
    }

    async execute(sql: string, params?: any[]): Promise<void> {

        if (!this.clientSession) {
            throw new Error("Client session is not initialized.");
        }
        await this.clientSession.execute(sql, params);
    }

    scalar<T>(sql: string, params?: any[]): Promise<T> {

            if (!this.clientSession) {
                throw new Error("Client session is not initialized.");
            }

            return this.clientSession.scalar<T>(sql, params);
        }

    exists(sql: string, params?: any[]): Promise<boolean> {

            if (!this.clientSession) {
                throw new Error("Client session is not initialized.");
            }
            return this.clientSession.exists(sql, params);
        }

    beginTransaction(): Promise<void> {

            if (!this.clientSession) {
                throw new Error("Client session is not initialized.");
            }
            return this.clientSession.beginTransaction();
        }

    commitTransaction(): Promise<void> {

            if (!this.clientSession) {
                throw new Error("Client session is not initialized.");
            }
            return this.clientSession.commitTransaction();
        }

    rollbackTransaction(): Promise<void> {

            if (!this.clientSession) {
                throw new Error("Client session is not initialized.");
            }
            return this.clientSession.rollbackTransaction();
        }

    isOpen(): boolean {

            if (!this.clientSession) {
                throw new Error("Client session is not initialized.");
            }
            return this.clientSession.isOpen();
        }

    isReady(): boolean {
        return this.clientSession.isReady();
    }
    async dispose(): Promise<void> {

            if (!this.clientSession) {
                throw new Error("Client session is not initialized.");
            }
            await this.clientSession.dispose();
        }
        
}