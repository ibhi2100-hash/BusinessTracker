import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export interface Migration {
    version: number;
    name: string;
    up(): readonly SQLiteMigrationOperation[]
}