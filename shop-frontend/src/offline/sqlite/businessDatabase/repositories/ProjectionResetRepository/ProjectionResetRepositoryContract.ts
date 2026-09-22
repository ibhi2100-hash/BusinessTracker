import type {
    SQLiteStatementOperation,
} from "@/src/storage/statement/worker/WorkerProtocol";


export type ProjectionName =
    | "businesses"
    | "branches"
    | "products"
    | "inventories"
    | "sales";


export interface ProjectionResetRepository {

    resetOperation(
        name: ProjectionName
    ): SQLiteStatementOperation;

    resetOperations():
        readonly SQLiteStatementOperation[];

    reset(
        name: ProjectionName
    ): Promise<void>;

    resetAll(): Promise<void>;
}