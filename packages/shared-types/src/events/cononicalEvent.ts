import { Mode } from "../enums/Mode";

export interface CanonicalEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  type: string;
  mode: Mode;
  payload: any;

  businessId: string | null;
  branchId: string | null;

  createdAt: Date;
  userId: string;
  causationId: string | null;
  correlationId: string | null;
}