import { Mode } from "../enums/Mode";

export interface BackendEvent {
  id: string;

  businessId: string;
  branchId: string | null;

  aggregateId: string;
  aggregateType: string;

  aggregateVersion: number;
  globalPosition: bigint;

  type: string;
  payload: unknown;

  mode: Mode;

  userId: string;
  deviceId: string;

  causationId: string | null;
  correlationId: string | null;

  logicClock: bigint;

  checksum: string | null;

  createdAt: Date;
}
