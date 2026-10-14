import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 

import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js"; 

export class EmployeeRequestRepository {
  async create(
    data: Prisma.EmployeeRequestUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeRequest.create({ data });
  }

  async upsert(
    data: Prisma.EmployeeRequestUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    const { id, ...fields } = data;

    await tx.employeeRequest.upsert({
      where: { id },
      create: data,
      update: fields,
    });
  }

  async update(
    id: string,
    data: Prisma.EmployeeRequestUncheckedUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeRequest.update({
      where: { id },
      data,
    });
  }

  async updateAssignment(
    id: string,
    assignedToEmployeeId: string | null,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeRequest.update({
      where: { id },
      data: { assignedToEmployeeId },
    });
  }

  async updateResolution(
    id: string,
    status: string,
    resolution: string | null,
    resolvedAt: Date | null,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeRequest.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt,
      },
    });
  }

  async findById(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeRequest.findUnique({
      where: { id },
    });
  }

  async findByBusiness(
    businessId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeRequest.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByBranch(
    branchId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeRequest.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByAssignee(
    assignedToEmployeeId: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeRequest.findMany({
      where: { assignedToEmployeeId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByStatus(
    status: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.employeeRequest.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });
  }
}
