export async function runProjectionWorker(prisma, workerId: string) {
  while (true) {
    const events = await prisma.event.findMany({
      where: { status: "PENDING", processingLock: null },
      take: 50,
      orderBy: [{ aggregateId: "asc" }, { version: "asc" }],
    });

    if (!events.length) {
      await sleep(500);
      continue;
    }

    await prisma.event.updateMany({
      where: { id: { in: events.map(e => e.id) } },
      data: {
        status: "PROCESSING",
        processingLock: workerId,
      },
    });

    for (const event of events) {
      try {
        await projectEvent(event, prisma);

        await prisma.event.update({
          where: { id: event.id },
          data: {
            status: "SYNCED",
            processedAt: new Date(),
            processingLock: null,
          },
        });
      } catch (e: any) {
        await prisma.event.update({
          where: { id: event.id },
          data: {
            status: "FAILED",
            retryCount: { increment: 1 },
            lastError: String(e),
            processingLock: null,
          },
        });
      }
    }
  }
}