import { BaseEvent } from "./types";

export type EventValidator<T = any> = (event: BaseEvent) => T;