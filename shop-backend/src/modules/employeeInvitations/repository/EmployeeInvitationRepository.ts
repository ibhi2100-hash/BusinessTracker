
import type {
  EmployeeInvitation as DomainEmployeeInvitation,
} from "@business/shared-types";

import {
  EmployeeInvitation as PrismaEmployeeInvitation,
  EmployeeInvitationStatus,
  Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class EmployeeInvitationRepository {
  /**
   * Creates an invitation from the domain model.
   *
   * All domain timestamps are Unix milliseconds and are converted
   * to JavaScript Date instances by the mapper.
   */
  async create(
    invitation: DomainEmployeeInvitation,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.create({
      data: EmployeeInvitationMapper.toCreateInput(invitation),
    });
  }

  /**
   * Creates or updates an invitation using its domain ID.
   *
   * The original createdAt timestamp is preserved when updating.
   */
  async upsert(
    invitation: DomainEmployeeInvitation,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.upsert({
      where: { id: invitation.id },
      create: EmployeeInvitationMapper.toCreateInput(invitation),
      update: EmployeeInvitationMapper.toUpdateInput(invitation),
    });
  }

  async findById(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<DomainEmployeeInvitation | null> {
    const row = await tx.employeeInvitation.findUnique({
      where: { id },
    });

    return row ? EmployeeInvitationMapper.fromRow(row) : null;
  }

  async findByEmployee(
    employeeId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<DomainEmployeeInvitation[]> {
    const rows = await tx.employeeInvitation.findMany({
      where: { employeeId },
      orderBy: [
        { createdAt: "desc" },
        { id: "asc" },
      ],
    });

    return rows.map(EmployeeInvitationMapper.fromRow);
  }

  async findByBusiness(
    businessId: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<DomainEmployeeInvitation[]> {
    const rows = await tx.employeeInvitation.findMany({
      where: { businessId },
      orderBy: [
        { createdAt: "desc" },
        { id: "asc" },
      ],
    });

    return rows.map(EmployeeInvitationMapper.fromRow);
  }

  async updateStatus(
    id: string,
    status: EmployeeInvitationStatus,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.update({
      where: { id },
      data: { status },
    });
  }

  async accept(
    id: string,
    acceptedAt: number,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.update({
      where: { id },
      data: {
        status: EmployeeInvitationStatus.ACCEPTED,
        acceptedAt: EmployeeInvitationMapper.toDate(acceptedAt),
      },
    });
  }

  async revoke(
    id: string,
    revokedAt: number,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.update({
      where: { id },
      data: {
        status: EmployeeInvitationStatus.REVOKED,
        revokedAt: EmployeeInvitationMapper.toDate(revokedAt),
      },
    });
  }

  async expire(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.update({
      where: { id },
      data: {
        status: EmployeeInvitationStatus.EXPIRED,
      },
    });
  }


async findByTokenHash(
  tokenHash: string,
  tx: Prisma.TransactionClient = prisma,
): Promise<DomainEmployeeInvitation | null> {
  const row = await tx.employeeInvitation.findUnique({
    where: { tokenHash },
  });

  return row ? EmployeeInvitationMapper.fromRow(row) : null;
}

/**
 * Atomically claims a pending, unexpired invitation.
 * Must be called inside the acceptance transaction.
 */
async claimForAcceptance(
  id: string,
  tokenHash: string,
  acceptedAt: number,
  tx: Prisma.TransactionClient,
): Promise<boolean> {
  const result = await tx.employeeInvitation.updateMany({
    where: {
      id,
      tokenHash,
      status: EmployeeInvitationStatus.PENDING,
      expiresAt: {
        gt: EmployeeInvitationMapper.toDate(acceptedAt),
      },
    },
    data: {
      status: EmployeeInvitationStatus.ACCEPTED,
      acceptedAt: EmployeeInvitationMapper.toDate(acceptedAt),
    },
  });

  return result.count === 1;
}

}

export class EmployeeInvitationMapper {
  /**
   * Converts a Unix-millisecond timestamp into a Prisma-compatible Date.
   */
  static toDate(timestamp: number): Date {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      throw new RangeError(
        `Invalid employee invitation timestamp: ${timestamp}`,
      );
    }

    return date;
  }

  /**
   * Converts a nullable Unix-millisecond timestamp.
   */
  static toNullableDate(timestamp: number | null): Date | null {
    return timestamp === null ? null : this.toDate(timestamp);
  }

  /**
   * Converts a nullable Prisma DateTime into Unix milliseconds.
   */
  static fromNullableDate(date: Date | null): number | null {
    return date === null ? null : date.getTime();
  }

  /**
   * Maps the domain invitation into Prisma's create input.
   */
  static toCreateInput(
    invitation: DomainEmployeeInvitation,
  ): Prisma.EmployeeInvitationUncheckedCreateInput {
    return {
      id: invitation.id,
      businessId: invitation.businessId,
      employeeId: invitation.employeeId,
      branchId: invitation.branchId,
      email: invitation.email,
      phone: invitation.phone,
      role: invitation.role,
      status: invitation.status,
      tokenHash: invitation.tokenHash,
      expiresAt: this.toNullableDate(invitation.expiresAt),
      createdAt: this.toDate(invitation.createdAt),
      acceptedAt: this.toNullableDate(invitation.acceptedAt),
      revokedAt: this.toNullableDate(invitation.revokedAt),
      updatedAt: this.toDate(invitation.updatedAt),
      version: invitation.version,
    };
  }

  /**
   * Maps mutable domain fields into Prisma's update input.
   *
   * The ID is the upsert selector, and createdAt remains immutable.
   */
  static toUpdateInput(
    invitation: DomainEmployeeInvitation,
  ): Prisma.EmployeeInvitationUncheckedUpdateInput {
    return {
      businessId: invitation.businessId,
      employeeId: invitation.employeeId,
      branchId: invitation.branchId,
      email: invitation.email,
      phone: invitation.phone,
      role: invitation.role,
      status: invitation.status,
      expiresAt: this.toNullableDate(invitation.expiresAt),
      acceptedAt: this.toNullableDate(invitation.acceptedAt),
      revokedAt: this.toNullableDate(invitation.revokedAt),
      updatedAt: this.toDate(invitation.updatedAt),
      version: invitation.version,
    };
  }

  /**
   * Maps a persisted Prisma row back into the domain model.
   */
  static fromRow(
    row: PrismaEmployeeInvitation,
  ): DomainEmployeeInvitation {
    return {
      id: row.id,
      businessId: row.businessId,
      employeeId: row.employeeId,
      branchId: row.branchId,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      tokenHash: row.tokenHash,
      expiresAt: this.fromNullableDate(row.expiresAt),
      createdAt: row.createdAt.getTime(),
      acceptedAt: this.fromNullableDate(row.acceptedAt),
      revokedAt: this.fromNullableDate(row.revokedAt),
      updatedAt: row.updatedAt.getTime(),
      version: row.version,
    };
  }
}
