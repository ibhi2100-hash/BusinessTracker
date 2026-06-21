export interface CanonicalEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  type: string;
  payload: any;

  businessId: string | null;
  branchId: string | null;

  createdAt: Date;
  userId: string | null;
  causationId: string | null;
  correlationId: string | null;
}