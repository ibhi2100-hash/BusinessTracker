import { saleReducer } from "../reducers/saleReducer";
import { inventoryReducer } from "../reducers/inventoryReducer";
import { ledgerReducer } from "../reducers/ledgerReducer";
import { productReducer } from "../reducers/ProductReducer";

const reducers = [
    saleReducer,
    inventoryReducer,
    ledgerReducer,
    productReducer
]

export async function runReducers( event: any) {

    for (const reducer of reducers ) {
        await reducer(event);
    }
}