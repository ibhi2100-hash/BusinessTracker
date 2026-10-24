
import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 

import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js"; 

export class EmployeeCompensationRepository {
  async upsert(
    data: Prisma.EmployeeCompensationUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    const { employeeId, ...fields } = data;

    await tx.employeeCompensation.upsert({
      where: { employeeId },
      create: data,
      update: fields,
    });
  }

  async update(
    employeeId: string,
    data: Prisma.EmployeeCompensationUncheckedUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeCompensation.update({
      where: { employeeId },
      data,
    });
  }

  async findByEmployee(
    employeeId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeCompensation.findUnique({
      where: { employeeId },
    });
  }

  async insertHistory(
    data: Prisma.EmployeeCompensationHistoryUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeCompensationHistory.create({ data });
  }

  async closeOpenHistory(
    employeeId: string,
    effectiveTo: Date,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeCompensationHistory.updateMany({
      where: {
        employeeId,
        effectiveTo: null,
      },
      data: { effectiveTo },
    });
  }

  async findHistory(
    employeeId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeCompensationHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveFrom: "desc" },
    });
  }
}
