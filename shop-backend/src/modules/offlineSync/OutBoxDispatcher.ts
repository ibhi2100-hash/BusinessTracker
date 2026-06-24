import { CanonicalEvent } from "@business/shared-types";
import { prisma } from "../../infrastructure/postgresql/prismaClient.js";
import { EventBus } from "@business/event-bus";

export class OutboxDispatcher {

  constructor(
    private eventBus: EventBus<CanonicalEvent>
  ) {}

  async runOnce() {

    const batch = await prisma.outboxEvent.findMany({
      where: { status: "PENDING" },
      take: 100,
      orderBy: { createdAt: "asc" }
    });

    if (batch.length === 0) return;

    try {

      // publish to event bus (publish each event individually)
      const events: CanonicalEvent[] = batch.map(e => ({
        id: e.id,
        aggregateId: e.aggregateId,
        aggregateType: e.aggregateType,
        type: e.type,
        payload: e.payload as any,
        aggregateVersion: e.aggregateVersion,
        timestamp: e.createdAt,
        // include any additional fields from the original payload/record to satisfy CanonicalEvent
        ...(e.payload || {})
      } as unknown as CanonicalEvent));

      await Promise.all(events.map(evt => this.eventBus.publish(evt)));

      // mark as sent
      await prisma.outboxEvent.updateMany({
        where: {
          id: { in: batch.map(b => b.id) }
        },
        data: {
          status: "SENT",
          processedAt: new Date()
        }
      });

    } catch (err) {

      console.error("OUTBOX_DISPATCH_FAILED", err);

    }
  }
}