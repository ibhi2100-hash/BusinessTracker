import { BaseEvent } from "@business/shared-types";

export type EventValidator<T = any> = (event: BaseEvent) => T;