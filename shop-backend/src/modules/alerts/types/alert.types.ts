// src/modules/alert/alert.types.ts

import { AlertType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";

export type AlertMetadataMap = {
  [AlertType.LOW_STOCK]: {
    productId: string;
  };
  [AlertType.CASH_VARIANCE]: {
    sessionId: string;
  };
};