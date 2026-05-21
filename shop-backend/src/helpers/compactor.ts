export async function compactEvents(aggregateId: string, lastVersion: number, prisma: any) {
  await prisma.event.updateMany({
    where: {
      aggregateId,
      version: { lte: lastVersion },
    },
    data: {
      archived: true,
    },
  });
}