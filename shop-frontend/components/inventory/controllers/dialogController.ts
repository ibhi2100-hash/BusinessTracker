import {
    InventoryDialog,
    InventoryDialogs
} from "./InventoryDialog";

import { InventoryDialogState } from "./InventoryDialogState";

import { inventoryProduct } from "@/src/store/inventoryStore";

export class InventoryDialogController
    implements InventoryDialogs {

    constructor(
        private readonly state: InventoryDialogState,
        private readonly update: (
            state: InventoryDialogState
        ) => void
    ) {}

    get activeDialog() {
        return this.state.activeDialog;
    }

    get selectedProduct() {
        return this.state.selectedProduct;
    }

    openCreate() {

        this.update({

            activeDialog: "create",

            selectedProduct: null

        });

    }

    openManage(product: inventoryProduct) {

        this.update({

            activeDialog: "manage",

            selectedProduct: product

        });

    }

    openEdit(product: inventoryProduct) {

        this.update({

            activeDialog: "edit",

            selectedProduct: product

        });

    }

    openReceive(product: inventoryProduct) {

        this.update({

            activeDialog: "receive",

            selectedProduct: product

        });

    }

    openAdjust(product: inventoryProduct) {

        this.update({

            activeDialog: "adjust",

            selectedProduct: product

        });

    }

    openTransfer(product: inventoryProduct) {

        this.update({

            activeDialog: "transfer",

            selectedProduct: product

        });

    }

    openHistory(product: inventoryProduct) {

        this.update({

            activeDialog: "history",

            selectedProduct: product

        });

    }

    close() {

        this.update({

            activeDialog: null,

            selectedProduct: null

        });

    }

    isOpen(dialog: InventoryDialog) {

        return this.state.activeDialog === dialog;

    }

}