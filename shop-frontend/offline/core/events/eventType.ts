import { financeEventType } from "@business/shared-types";
import { InventoryEventType } from "@business/shared-types";
import { salesEventType } from "@business/shared-types";
import { BusinessEventTypes } from "@business/shared-types";
import { OpeningEventType } from "@business/shared-types";

export type EventType =
  | typeof financeEventType[keyof typeof financeEventType]
  | typeof InventoryEventType[keyof typeof InventoryEventType]
  | typeof salesEventType[keyof typeof salesEventType]
  | typeof BusinessEventTypes[keyof typeof BusinessEventTypes]
  | typeof OpeningEventType[keyof typeof OpeningEventType];