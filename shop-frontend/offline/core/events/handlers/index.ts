// core/event/handlers/index.ts
import { businessHandler } from "./businessHandler";
import { assetHandler } from "./assetHandler";
import { inventoryHandler } from "./inventoryHandler";
import { financialHandler } from "./financialHandler";

export const handlers = [
  businessHandler,
  assetHandler,
  inventoryHandler,
  financialHandler,
];