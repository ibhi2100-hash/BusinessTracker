
import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 

import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js"; 

export class EmployeeNotificationRepository {
  async create(
    data: Prisma.EmployeeNotificationUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeNotification.create({ data });
  }

  async markRead(
    id: string,
    readAt: Date,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeNotification.update({
      where: { id },
      data: {
        readAt,
        isRead: true,
      },
    });
  }

  async findByEmployee(
    employeeId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeNotification.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findUnread(
    employeeId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeNotification.findMany({
      where: {
        employeeId,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
