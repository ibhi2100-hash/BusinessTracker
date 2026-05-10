export async function compactEvents(aggregateId, lastVersion, prisma) {
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