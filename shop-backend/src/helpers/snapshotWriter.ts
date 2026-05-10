export async function saveSnapshot(
  aggregateId,
  state,
  lastVersion,
  prisma
) {
  return prisma.snapshot.upsert({
    where: {
      businessId_branchId_account_snapshotType_scope: {
        businessId: aggregateId,
        branchId: null,
        account: null,
        snapshotType: "BUSINESS",
        scope: "GLOBAL",
      },
    },
    create: {
      id: crypto.randomUUID(),
      businessId: aggregateId,
      version: lastVersion,
      lastVersion,
      data: state,
      snapshotType: "BUSINESS",
      scope: "GLOBAL",
    },
    update: {
      version: lastVersion,
      lastVersion,
      data: state,
    },
  });
}