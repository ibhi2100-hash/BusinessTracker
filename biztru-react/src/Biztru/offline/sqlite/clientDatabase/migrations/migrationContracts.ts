import type{ SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export interface Migration {
    version: number;
    name: string;
    up(): readonly SQLiteMigrationOperation[]
}