import { queueSyncHandler } from "./queueSyncHandler";
import { websocketHandler } from "./websocketHandler";
import { analyticsHandler } from "./analyticHandler";

export const handlers = {

  PRODUCT_CREATED: [
    queueSyncHandler,
    websocketHandler,
  ],

  SALE_ADDED: [
    analyticsHandler,
  ],
};