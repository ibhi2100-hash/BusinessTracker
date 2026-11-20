import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";
import { PlatformProjectionEventRepository } from "../repositories/platform-projection-event.repository.js";

type DbClient = Prisma.TransactionClient;

export interface TenantProjectionEvent {
  id: string;
  businessId: string;
  globalPosition: bigint;
  eventType: string;
  payload: Prisma.JsonValue;
  occurredAt: Date;
}

export interface BillingProjectionEvent {
  id: string;
  businessId: string | null;
  eventType: string;
  payload: Prisma.JsonValue;
  occurredAt: Date;
}

export type TenantEventHandler = (
  event: TenantProjectionEvent,
  tx: DbClient,
) => Promise<void>;

export type BillingEventHandler = (
  event: BillingProjectionEvent,
  tx: DbClient,
) => Promise<void>;

export class PlatformProjectionConsumerService {
  private readonly tenantHandlers = new Map<string, TenantEventHandler>();
  private readonly billingHandlers = new Map<string, BillingEventHandler>();

  constructor(
    private readonly eventRepository: PlatformProjectionEventRepository,
  ) {}

  registerTenantHandler(type: string, handler: TenantEventHandler) {
    if (!type.trim()) throw new Error("Tenant event type is required.");
    this.tenantHandlers.set(type, handler);
  }

  registerBillingHandler(type: string, handler: BillingEventHandler) {
    if (!type.trim()) throw new Error("Billing event type is required.");
    this.billingHandlers.set(type, handler);
  }

  async consumeTenantEvents(batchSize = 100) {
    const consumerName = "PLATFORM_TENANT_PROJECTION";
    const checkpoint = await this.eventRepository.getCheckpoint(consumerName);
    const events = await this.eventRepository.getTenantEvents(
      checkpoint?.lastProcessedPosition ?? 0n,
      batchSize,
    );

    let processed = 0;
    let skipped = 0;

    for (const event of events) {
      await prisma.$transaction(async (tx) => {
        const alreadyProcessed = await this.eventRepository.isProcessed(
          consumerName,
          event.id,
          tx,
        );

        if (alreadyProcessed) {
          skipped++;
          await this.eventRepository.advanceTenantCheckpoint(
            consumerName,
            event.globalPosition,
            event.id,
            tx,
          );
          return;
        }

        const handler = this.tenantHandlers.get(event.type);

        if (handler) {
          await handler(
            {
              id: event.id,
              businessId: event.businessId,
              globalPosition: event.globalPosition,
              eventType: event.type,
              payload: event.payload,
              occurredAt: event.createdAt,
            },
            tx,
          );
        }

        // Unknown event types are still acknowledged after being observed.
        // Register a handler before enabling any consumer that depends on
        // that event for a material projection.
        await this.eventRepository.markProcessed(
          consumerName,
          event.id,
          tx,
        );

        await this.eventRepository.advanceTenantCheckpoint(
          consumerName,
          event.globalPosition,
          event.id,
          tx,
        );

        processed++;
      });
    }

    return {
      consumerName,
      processed,
      skipped,
      fetched: events.length,
      lastPosition:
        events.length > 0
          ? events[events.length - 1].globalPosition.toString()
          : checkpoint?.lastProcessedPosition.toString() ?? "0",
    };
  }

  async consumeBillingEvents(batchSize = 100) {
    const consumerName = "PLATFORM_BILLING_PROJECTION";
    const checkpoint = await this.eventRepository.getCheckpoint(consumerName);

    const cursor = checkpoint?.cursor as
      | { occurredAt?: string; id?: string }
      | null;

    const after =
      cursor?.occurredAt && cursor.id
        ? { occurredAt: new Date(cursor.occurredAt), id: cursor.id }
        : null;

    const events = await this.eventRepository.getBillingEvents(
      after,
      batchSize,
    );

    let processed = 0;
    let skipped = 0;

    for (const event of events) {
      await prisma.$transaction(async (tx) => {
        const alreadyProcessed = await this.eventRepository.isProcessed(
          consumerName,
          event.id,
          tx,
        );

        if (alreadyProcessed) {
          skipped++;
          await this.eventRepository.advanceBillingCheckpoint(
            consumerName,
            event.occurredAt,
            event.id,
            tx,
          );
          return;
        }

        const handler = this.billingHandlers.get(event.eventType);

        if (handler) {
          await handler(
            {
              id: event.id,
              businessId: event.businessId,
              eventType: event.eventType,
              payload: event.payload,
              occurredAt: event.occurredAt,
            },
            tx,
          );
        }

        await this.eventRepository.markProcessed(
          consumerName,
          event.id,
          tx,
        );

        await this.eventRepository.advanceBillingCheckpoint(
          consumerName,
          event.occurredAt,
          event.id,
          tx,
        );

        processed++;
      });
    }

    return {
      consumerName,
      processed,
      skipped,
      fetched: events.length,
      lastEventId:
        events.length > 0
          ? events[events.length - 1].id
          : checkpoint?.lastProcessedEventId ?? null,
    };
  }
}