import { AlertType } from "../../infrastructure/postgresql/prisma/generated/enums.js";
import { prisma } from "../../infrastructure/postgresql/prismaClient.js";
async function resolveAlert(type: AlertType, branchId: string, refId?: string) {
  await prisma.alert.updateMany({
    where: {
      type,
      branchId,
      isResolved: false,
      metadata: { path: ["productId"], equals: refId }
    },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
    },
  });
}