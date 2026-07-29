import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { BusinessConnection } from "./BusinessConnection";

export class BusinessConnectionPool {
    private static instance: BusinessConnectionPool;

    private sqlite3: any = null;
    private pool: any = null;

    private readonly connections = new Map<string, BusinessConnection>();
    private readonly activeNodes = new Set<string>();

    private constructor() {}

    static getInstance(): BusinessConnectionPool {
        if (!BusinessConnectionPool.instance) {
            BusinessConnectionPool.instance = new BusinessConnectionPool();
        }

        return BusinessConnectionPool.instance;
    }

    private async initializeSQLite(): Promise<void> {
    if (this.pool) return;

    this.sqlite3 = await sqlite3InitModule();

    try {
        this.pool = await this.sqlite3.installOpfsSAHPoolVfs({
            initialCapacity: 16
        });

        console.log("Pool:", this.pool);
    } catch (e) {
        console.error("installOpfsSAHPoolVfs failed:", e);

        console.log("Secure Context:", self.isSecureContext);
        console.log("crossOriginIsolated:", self.crossOriginIsolated);
        console.log(
            "navigator.storage:",
            navigator.storage
        );
        console.log(
            "navigator.storage.getDirectory:",
            typeof navigator.storage?.getDirectory
        );
        console.log(
            "SharedArrayBuffer:",
            typeof SharedArrayBuffer
        );

        throw e;
    }
}
    async getConnection(nodeId: string): Promise<BusinessConnection> {
        await this.initializeSQLite();

        const existing = this.connections.get(nodeId);

        if (existing) {
            console.log(`[ConnectionPool] Reusing ${nodeId}`);
            return existing;
        }

        const connection = new BusinessConnection(
            nodeId,
            this.pool
        );

        await connection.open();

        this.connections.set(nodeId, connection);
        this.activeNodes.add(nodeId);

        return connection;
    }

    async closeConnection(nodeId: string): Promise<void> {
        const connection = this.connections.get(nodeId);

        if (!connection) {
            return;
        }

        await connection.close();

        this.connections.delete(nodeId);
        this.activeNodes.delete(nodeId);
    }

    async closeAll(): Promise<void> {
        for (const connection of this.connections.values()) {
            await connection.close();
        }

        this.connections.clear();
        this.activeNodes.clear();
    }

    hasConnection(nodeId: string): boolean {
        return this.connections.has(nodeId);
    }

    getActiveNodes(): string[] {
        return [...this.activeNodes];
    }
}