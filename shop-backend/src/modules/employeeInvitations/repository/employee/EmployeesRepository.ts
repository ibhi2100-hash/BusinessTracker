
import {
  Employee as PrismaEmployee,
  Prisma,
} from  "../../../../infrastructure/postgresql/prisma/generated/client.js"; 

import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js"; 

// Replace this import with the actual shared domain type path.
import type {
  Employee,
} from "@business/shared-types";

export class EmployeeRepository {
  async upsert(
    state: Employee,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.upsert(
      EmployeeMapper.toUpsertArgs(state),
    );
  }

  async findById(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Employee | null> {
    const row = await tx.employee.findUnique({
      where: { id },
    });

    return row ? EmployeeMapper.fromRow(row) : null;
  }

  async findByBusiness(
    businessId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Employee[]> {
    const rows = await tx.employee.findMany({
      where: { businessId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map(EmployeeMapper.fromRow);
  }

  async findByBranch(
    branchId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Employee[]> {
    const rows = await tx.employee.findMany({
      where: { branchId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map(EmployeeMapper.fromRow);
  }

  async findByUser(
    userId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Employee[]> {
    const rows = await tx.employee.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map(EmployeeMapper.fromRow);
  }

  async findReports(
    managerEmployeeId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<Employee[]> {
    const rows = await tx.employee.findMany({
      where: { reportsToEmployeeId: managerEmployeeId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map(EmployeeMapper.fromRow);
  }

  async updateStatus(
    id: string,
    employmentStatus: Employee["employmentStatus"],
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.update({
      where: { id },
      data: { employmentStatus },
    });
  }

  async updateUser(
    id: string,
    userId: string | null,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.update({
      where: { id },
      data: { userId },
    });
  }

  async updateJoined(
    id: string,
    joinedAt: number | null,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.update({
      where: { id },
      data: {
        joinedAt: joinedAt === null ? null : new Date(joinedAt),
      },
    });
  }

  async updateRole(
    id: string,
    role: Employee["role"],
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.update({
      where: { id },
      data: { role },
    });
  }

  async updateBranch(
    id: string,
    branchId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.update({
      where: { id },
      data: { branchId },
    });
  }

  async updateReportsTo(
    id: string,
    reportsToEmployeeId: string | null,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.update({
      where: { id },
      data: { reportsToEmployeeId },
    });
  }

  async delete(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employee.delete({
      where: { id },
    });
  }
}

export class EmployeeMapper {
  static toUpsertArgs(
    state: Employee,
  ): Prisma.EmployeeUpsertArgs {
    return {
      where: { id: state.id },

      create: {
        id: state.id,
        businessId: state.businessId,
        branchId: state.branchId,
        userId: state.userId,
        fullName: state.fullName,
        phone: state.phone,
        email: state.email,
        role: state.role,
        employmentStatus: state.employmentStatus,
        reportsToEmployeeId: state.reportsToEmployeeId,
        joinedAt:
          state.joinedAt === null
            ? null
            : new Date(state.joinedAt),
        createdAt: new Date(state.createdAt),
      },

      update: {
        branchId: state.branchId,
        userId: state.userId,
        fullName: state.fullName,
        phone: state.phone,
        email: state.email,
        role: state.role,
        employmentStatus: state.employmentStatus,
        reportsToEmployeeId: state.reportsToEmployeeId,
        joinedAt:
          state.joinedAt === null
            ? null
            : new Date(state.joinedAt),
      },
    };
  }

  static fromRow(row: PrismaEmployee): Employee {
    return {
      id: row.id,
      businessId: row.businessId,
      branchId: row.branchId,
      userId: row.userId,
      fullName: row.fullName,
      phone: row.phone,
      email: row.email,
      role: row.role,
      employeeNumber: row.employeeNumber ?? null,
      employmentStatus: row.employmentStatus,
      reportsToEmployeeId: row.reportsToEmployeeId,
      joinedAt: row.joinedAt?.getTime() ?? null,
      createdAt: row.createdAt.getTime(),
      updatedAt: row.createdAt.getTime() ?? null,
      version: row.version ?? 0,

      
    };
  }
}
