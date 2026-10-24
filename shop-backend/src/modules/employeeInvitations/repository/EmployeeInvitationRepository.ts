
import type {
  EmployeeInvitation as DomainEmployeeInvitation,
} from "@business/shared-types";

import {
  EmployeeInvitation as PrismaEmployeeInvitation,
  EmployeeInvitationStatus,
  Prisma,
  EmploymentStatus,
  Role,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class EmployeeInvitationRepository {
  async findByTokenHash(tokenHash: string) {
    return prisma.employeeInvitation.findUnique({
      where: { tokenHash },
      include: {
        business: true,
        branch: true,
        employee: true,
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async acceptInvitation(data: {
    invitationId: string;
    tokenHash: string;
    passwordHash: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();

      // Re-read all authoritative data inside the transaction.
      const invitation =
        await tx.employeeInvitation.findFirst({
          where: {
            id: data.invitationId,
            tokenHash: data.tokenHash,
            status: EmployeeInvitationStatus.PENDING,
            expiresAt: { gt: now },
          },
          include: {
            business: true,
            branch: true,
            employee: true,
          },
        });

      if (!invitation) {
        throw new Error(
          "Invalid or unavailable invitation",
        );
      }

      if (
        invitation.employee.employmentStatus !==
        EmploymentStatus.INVITED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
      ) {
        throw new Error(
          "Invalid or unavailable invitation",
        );
      }

      const email = (
        invitation.email ??
        invitation.employee.email ??
        ""
      ).trim().toLowerCase();

      if (!email) {
        throw new Error(
          "Invitation does not have an email address",
        );
      }

      const existingUser =
        await tx.user.findUnique({
          where: { email },
        });

      if (existingUser) {
        // Do not overwrite or silently take over an existing account.
        throw new Error("Email already registered");
      }

      /*
       * Claim the invitation conditionally.
       * If another request already accepted or revoked it,
       * the update count will be zero.
       */
      const claimed =
        await tx.employeeInvitation.updateMany({
          where: {
            id: invitation.id,
            tokenHash: data.tokenHash,
            status: EmployeeInvitationStatus.PENDING,
            expiresAt: { gt: now },
          },
          data: {
            status: EmployeeInvitationStatus.ACCEPTED,
            acceptedAt: now,
          },
        });

      if (claimed.count !== 1) {
        throw new Error(
          "Invalid or unavailable invitation",
        );
      }

      /*
       * Employee authorization belongs to EmployeeRole.
       * Do not elevate a newly created User to global ADMIN
       * merely because the employee's business role is ADMIN.
       */
      const user = await tx.user.create({
        data: {
          name: invitation.employee.fullName,
          email,
          password: data.passwordHash,
          role: Role.STAFF,
          isActive: true,
          businessId: invitation.businessId,
          branchId: invitation.branchId,
          onboardingCompleted: true,
        },
      });

      await tx.employee.update({
        where: {
          id: invitation.employeeId,
        },
        data: {
          userId: user.id,
          email,
          employmentStatus: EmploymentStatus.ACTIVE,
          joinedAt: now,
        },
      });

      // Return only the fields the API needs.
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          branchId: user.branchId,
          onboardingCompleted: user.onboardingCompleted,
        },
      };
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
