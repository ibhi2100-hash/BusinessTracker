import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";

export interface Migration {
    version: number;
    name: string;
    up(queryRunnner: QueryRunner): Promise<void>
}