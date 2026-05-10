export async function projectEvent(event, prisma) {
  switch (event.type) {
    case "BUSINESS_CREATED":
      await prisma.business.upsert({
        where: { id: event.payload.id },
        create: {
          id: event.payload.id,
          name: event.payload.name,
          address: event.payload.address,
          status: "ONBOARDING",
        },
        update: {},
      });
      break;

    case "BRANCH_CREATED":
      await prisma.branch.upsert({
        where: {
          id_businessId: {
            id: event.payload.id,
            businessId: event.payload.businessId,
          },
        },
        create: event.payload,
        update: {},
      });
      break;
  }
}