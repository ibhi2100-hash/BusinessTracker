
export type ProjectionName =
    | "businesses"
    | "branches"
    | "products"
    | "inventories"
    | "sales";

export interface ProjectionResetRepository {
    reset(name: ProjectionName): Promise<void>;
    resetAll(): Promise<void>;
}