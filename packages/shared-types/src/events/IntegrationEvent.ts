export interface IntegrationEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  type: string;
  payload: any;
  businessId?: string;
  branchId?: string;
  userId: string;
  createdAt: Date;
  logicClock: number;
}