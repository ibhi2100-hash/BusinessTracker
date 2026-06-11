import { BaseEvent } from "@business/shared-types";
import { eventValidators } from "./eventRegistry";

export class EventValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventValidationError";
  }
}

export function validateEvent(event: BaseEvent) {
  // 1. Base structure
  if (!event.id) throw new EventValidationError("Missing event.id");
  if (!event.type) throw new EventValidationError("Missing event.type");

  // 2. Domain validator (THIS becomes authoritative)
  const validator = eventValidators[event.type];

  if (!validator) {
    throw new EventValidationError(`No validator for event type: ${event.type}`);
  }

  const isValid = validator(event);

  if (!isValid) {
    throw new EventValidationError(
      `Invalid payload for event type: ${event.type}`
    );
  }

  return true;
}