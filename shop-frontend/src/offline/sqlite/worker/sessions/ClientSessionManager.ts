// src/offline/sqlite/client/ClientDatabase.ts


import { ClientConnection } from "../../clientDatabase/ClientConnection";
import { ClientSession }  from "./ClientStorageSession"

export class ClientSessionManager {

    private static instance: ClientSessionManager;
    static getInstance() {
        if(!this.instance) {
            this.instance = new ClientSessionManager();

            return this.instance;
        }
    }

    private constructor(){}
    readonly connection: ClientConnection;

    private session: ClientSession | null = null;

   async initialize(): Promise<void> {
        if(this.session) return 

        this.session = new ClientSession();

        await this.session.initialize();
    }

    private requireSession(): ClientSession {

        if (!this.session) {
            throw new Error("Client session is not initialized.");
        }

        return this.session;
    }

    async query(sql: string, params?: any[]): Promise<any> {
        if (!this.session) {
            return;
        }
        return await this
            .requireSession()
            .query(sql, params);
    }

    async execute(sql: string, params?: any[]): Promise<void> {

        if (!this.session) {
            throw new Error("Session for Client does not exists")
        }
        await this
            .requireSession()
            .execute(sql, params);
    }

    scalar<T>(sql: string, params?: any[]): Promise<T> {

            if (!this.session) {
            return;
        }
            return this
                .requireSession()
                .scalar<T>(sql, params);
        }

    exists(sql: string, params?: any[]): Promise<boolean> {
            if (!this.session) {
            return;
        }
            return this
                .requireSession()
                .exists(sql, params);
        }

    beginTransaction(): Promise<void> {

           if (!this.session) {
            return;
        }
            return this
                .requireSession()
                .beginTransaction();
        }

    commitTransaction(): Promise<void> {

            if (!this.session) {
            return;
        }
            return this
                .requireSession()
                .commitTransaction();
        }

    rollbackTransaction(): Promise<void> {

           if (!this.session) {
            return;
        }
            return this
                .requireSession()
                .rollbackTransaction();
        }

    isOpen(): boolean {

            if (!this.session) {
            return;
        }
            return this
                .requireSession()
                .isOpen();
        }

    isReady(): boolean {
        return this
        .requireSession()
        .isReady();
    }
    async dispose(): Promise<void> {
            if (!this.session) {
            return;
        }
            await this
                .requireSession()
                .dispose();
        }
        
}