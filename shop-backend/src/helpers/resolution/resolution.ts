import { prisma } from "../../infrastructure/postgresql/prismaClient.js";
import { AlertType } from "../../infrastructure/postgresql/prisma/generated/enums.js";

async function resolveAlert(type: AlertType, branchId: string, refId?: string) {
  const where: any = {
    type,
    branchId,
    isResolved: false,
    ...(refId !== undefined && {
      metadata: {
        path: ["productId"],
        equals: refId,
      },
    }),
  };

  await prisma.alert.updateMany({
    where,
    data: {
      isResolved: true,
      resolvedAt: new Date(),
    },
  });
}