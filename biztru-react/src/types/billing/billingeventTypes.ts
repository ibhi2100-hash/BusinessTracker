
export interface BillingEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;

  eventType: string;
  eventVersion: number;

  actorId: string | null;
  tenantId: string | null;

  payload: Record<string, unknown>;

  occurredAt: string;

  synchronizationStatus:
    | "PENDING"
    | "PROCESSING"
    | "PROCESSED"
    | "FAILED";

  processedAt: string | null;
}
