import { prisma } from "../../infrastructure/postgresql/prismaClient.js";
export class ReplayEngine {

  async replayAggregate(
    aggregateType: string,
    aggregateId: string,
    handler: (event: any) => Promise<void>
  ) {
    const events = await prisma.event.findMany({
      where: {
        aggregateType,
        aggregateId,
      },
      orderBy: {
        aggregateVersion: "asc",
      },
    });

    for (const event of events) {
      await handler(event);
    }
  }
}
