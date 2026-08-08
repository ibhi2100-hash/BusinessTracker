import { useMemo, useState } from "react";

import { InventoryDialogController } from "../controllers/dialogController";

import { InventoryDialogState } from "./useInventoryDialogs";

export function useInventoryDialogs() {

    const [state, setState] =
        useState<InventoryDialogState>({

            activeDialog: null,

            selectedProduct: null

        });

    return useMemo(() => {

        return new InventoryDialogController(

            state,

            setState

        );

    }, [state]);

}