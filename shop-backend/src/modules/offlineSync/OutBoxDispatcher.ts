import { prisma } from "../../infrastructure/postgresql/prismaClient.js";
import { EventBus } from "@business/event-bus";

export class OutboxDispatcher {

  constructor(
    private eventBus: EventBus
  ) {}

  async runOnce() {

    const batch = await prisma.outboxEvent.findMany({
      where: { status: "PENDING" },
      take: 100,
      orderBy: { createdAt: "asc" }
    });

    if (batch.length === 0) return;

    try {

      // publish to event bus
      await this.eventBus.publish(
        batch.map(e => ({
          id: e.id,
          aggregateId: e.aggregateId,
          aggregateType: e.aggregateType,
          type: e.type,
          payload: e.payload,
          aggregateVersion: e.aggregateVersion
        }))
      );

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