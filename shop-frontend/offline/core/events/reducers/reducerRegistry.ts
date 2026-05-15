import { ProductReducer } from "./productReducer";
import { InventoryReducer } from "./inventoryReducer";
import { BusinessReducer } from "./businessReducer";

export const reducers = {

  PRODUCT:
    ProductReducer,

  INVENTORY:
    InventoryReducer,

  BUSINESS:
    BusinessReducer,
};