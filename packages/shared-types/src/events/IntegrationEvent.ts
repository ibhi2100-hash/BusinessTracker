import { Mode } from "../enums/Mode";

export interface IntegrationEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  type: string;
  mode: Mode;
  payload: any;
  businessId?: string | null;
  branchId?: string | null;
  userId: string;
  createdAt: Date;
}