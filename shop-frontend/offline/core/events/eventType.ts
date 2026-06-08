import { financeEventType } from "@business/shared-types/src/eventGroups/financeEvent";
import { InventoryEventType } from "@business/shared-types/src/eventGroups/inventoryEvents";
import { salesEventType } from "@business/shared-types/src/eventGroups/salesEvent";
import { BusinessEventTypes } from "@business/shared-types/src/eventGroups/businessEvents";
import { OpeningEventType } from "@business/shared-types/src/eventGroups/openingEvents";

export type EventType =
  | typeof financeEventType[keyof typeof financeEventType]
  | typeof InventoryEventType[keyof typeof InventoryEventType]
  | typeof salesEventType[keyof typeof salesEventType]
  | typeof BusinessEventTypes[keyof typeof BusinessEventTypes]
  | typeof OpeningEventType[keyof typeof OpeningEventType];