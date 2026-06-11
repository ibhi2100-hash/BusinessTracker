import { BaseEvent }
  from "@business/shared-types";

export interface RebasePayload {

  aggregateId: string;

  aggregateType: string;

  serverVersion: number;

  serverSnapshot?: any;

  serverEvents: BaseEvent[];

  pendingEvents: BaseEvent[];
}