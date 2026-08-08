import { inventoryProduct } from "@/src/store/inventoryStore";

export type InventoryDialog =
    | "create"
    | "manage"
    | "edit"
    | "receive"
    | "adjust"
    | "transfer"
    | "history";

export interface InventoryDialogs {

    activeDialog: InventoryDialog | null;

    selectedProduct: inventoryProduct | null;

    openCreate(): void;

    openManage(product: inventoryProduct): void;

    openEdit(product: inventoryProduct): void;

    openReceive(product: inventoryProduct): void;

    openAdjust(product: inventoryProduct): void;

    openTransfer(product: inventoryProduct): void;

    openHistory(product: inventoryProduct): void;

    close(): void;

    isOpen(dialog: InventoryDialog): boolean;
}