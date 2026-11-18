
import type {
  EmployeeInvitation as DomainEmployeeInvitation,
  EmployeeRole as DomainEmployeeRole,
} from "@business/shared-types";

import {
  EmployeeInvitation as PrismaEmployeeInvitation,
  EmployeeInvitationStatus,
  Prisma,
  EmploymentStatus,
  Role,
  EmployeeRole as PrismaEmployeeRole,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

/* -------------------------------------------------------------------------- */
/* EMPLOYEE INVITATION REPOSITORY                                             */
/* -------------------------------------------------------------------------- */

export class EmployeeInvitationRepository {
  private readonly debugPrefix = "[EMPLOYEE INVITATION REPOSITORY]";

  private debug(stage: string, data?: unknown): void {
    console.log(`${this.debugPrefix} ${stage}`, data ?? "");
  }

  private debugError(stage: string, error: unknown): void {
    console.error(`${this.debugPrefix} ${stage}`, error);
  }

  /**
   * Find an invitation using its hashed token.
   */
  async findByTokenHash(tokenHash: string) {
    const invitation = await prisma.employeeInvitation.findUnique({
      where: { tokenHash },
      include: {
        business: true,
        branch: true,
        employee: true,
      },
    });

    this.debug("FIND INVITATION RESULT", {
      found: Boolean(invitation),
      invitationId: invitation?.id,
      invitationRole: invitation?.role,
      employeeRole: invitation?.employee?.role,
      status: invitation?.status,
    });

    return invitation;
  }

  /**
   * Find an existing user by email.
   */
  async findUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    this.debug("USER EMAIL LOOKUP", {
      email: normalizedEmail,
      userFound: Boolean(user),
      existingUserRole: user?.role,
    });

    return user;
  }

  /**
   * Atomically accepts an employee invitation.
   */
  async acceptInvitation(data: {
    invitationId: string;
    tokenHash: string;
    passwordHash: string;
  }) {
    this.debug("ACCEPTANCE REQUEST RECEIVED", {
      invitationId: data.invitationId,
      timestamp: new Date().toISOString(),
    });

    try {
      return await prisma.$transaction(async (tx) => {
        const now = new Date();

        // --------------------------------------------------------------
        // STEP 1: LOAD AUTHORITATIVE INVITATION
        // --------------------------------------------------------------

        this.debug("STEP 1 - LOADING INVITATION", {
          invitationId: data.invitationId,
        });

        const invitation = await tx.employeeInvitation.findFirst({
          where: {
            id: data.invitationId,
            tokenHash: data.tokenHash,
            status: EmployeeInvitationStatus.PENDING,
            expiresAt: {
              gt: now,
            },
          },
          include: {
            business: true,
            branch: true,
            employee: true,
          },
        });

        if (!invitation) {
          this.debug("STEP 1 FAILED - INVITATION NOT FOUND", {
            invitationId: data.invitationId,
          });

          throw new Error("Invalid or unavailable invitation");
        }

        this.debug("STEP 1 SUCCESS - INVITATION LOADED", {
          invitationId: invitation.id,
          employeeId: invitation.employeeId,
          businessId: invitation.businessId,
          branchId: invitation.branchId,
          invitationRole: invitation.role,
          employeeRole: invitation.employee.role,
          invitationStatus: invitation.status,
          employmentStatus: invitation.employee.employmentStatus,
          expiresAt: invitation.expiresAt?.toISOString(),
        });

        // --------------------------------------------------------------
        // STEP 2: VALIDATE EMPLOYEE STATUS
        // --------------------------------------------------------------

        this.debug("STEP 2 - VALIDATING EMPLOYEE", {
          employeeId: invitation.employee.id,
          employmentStatus: invitation.employee.employmentStatus,
          expectedStatus: EmploymentStatus.INVITED,
        });

        if (
          invitation.employee.employmentStatus !==
          EmploymentStatus.INVITED
        ) {
          this.debug("STEP 2 FAILED - INVALID EMPLOYMENT STATUS", {
            actual: invitation.employee.employmentStatus,
          });

          throw new Error("Invalid or unavailable invitation");
        }

        this.debug("STEP 2 SUCCESS - EMPLOYEE STATUS VALID");

        // --------------------------------------------------------------
        // STEP 3: NORMALIZE EMAIL
        // --------------------------------------------------------------

        const email = (
          invitation.email ??
          invitation.employee.email ??
          ""
        )
          .trim()
          .toLowerCase();

        this.debug("STEP 3 - EMAIL VALIDATION", {
          invitationEmail: invitation.email,
          employeeEmail: invitation.employee.email,
          normalizedEmail: email,
        });

        if (!email) {
          throw new Error(
            "Invitation does not have an email address",
          );
        }

        // --------------------------------------------------------------
        // STEP 4: CHECK EXISTING USER
        // --------------------------------------------------------------

        const existingUser = await tx.user.findUnique({
          where: { email },
        });

        this.debug("STEP 4 - EXISTING USER CHECK", {
          email,
          existingUserFound: Boolean(existingUser),
          existingUserId: existingUser?.id,
          existingUserRole: existingUser?.role,
        });

        if (existingUser) {
          throw new Error("Email already registered");
        }

        // --------------------------------------------------------------
        // STEP 5: VERIFY ROLE BEFORE USER CREATION
        // --------------------------------------------------------------

        this.debug("STEP 5 - ROLE VERIFICATION STARTED");

        const invitationRole = invitation.role;
        const employeeRole = invitation.employee.role;

        const mappedUserRole =
          this.mapEmployeeRoleToUserRole(invitationRole);

        this.debug("STEP 5 - ROLE VERIFICATION RESULT", {
          invitationId: invitation.id,
          employeeId: invitation.employee.id,

          invitationRole,
          employeeRole,

          mappedUserRole,

          rolesMatch: invitationRole === employeeRole,
        });

        if (invitationRole !== employeeRole) {
          this.debug(
            "WARNING - INVITATION ROLE AND EMPLOYEE ROLE DO NOT MATCH",
            {
              invitationRole,
              employeeRole,
              selectedSource: "invitation.role",
              mappedUserRole,
            },
          );
        }

        // --------------------------------------------------------------
        // STEP 6: CLAIM INVITATION
        // --------------------------------------------------------------

        this.debug("STEP 6 - CLAIMING INVITATION", {
          invitationId: invitation.id,
        });

        const claimed = await tx.employeeInvitation.updateMany({
          where: {
            id: invitation.id,
            tokenHash: data.tokenHash,
            status: EmployeeInvitationStatus.PENDING,
            expiresAt: {
              gt: now,
            },
          },
          data: {
            status: EmployeeInvitationStatus.ACCEPTED,
            acceptedAt: now,
          },
        });

        this.debug("STEP 6 - INVITATION CLAIM RESULT", {
          invitationId: invitation.id,
          claimedCount: claimed.count,
          success: claimed.count === 1,
        });

        if (claimed.count !== 1) {
          throw new Error("Invalid or unavailable invitation");
        }

        // --------------------------------------------------------------
        // STEP 7: CREATE USER ACCOUNT
        // --------------------------------------------------------------

        this.debug("STEP 7 - USER CREATION STARTED", {
          invitationId: invitation.id,
          email,
          expectedUserRole: mappedUserRole,
          businessId: invitation.businessId,
          branchId: invitation.branchId,
        });

        const user = await tx.user.create({
          data: {
            name: invitation.employee.fullName,
            email,
            password: data.passwordHash,

            role: mappedUserRole,

            isActive: true,
            businessId: invitation.businessId,
            branchId: invitation.branchId,
            onboardingCompleted: true,
          },
        });

        this.debug("STEP 7 SUCCESS - USER CREATED", {
          invitationId: invitation.id,
          userId: user.id,
          email: user.email,

          expectedRole: mappedUserRole,
          savedRole: user.role,

          roleMatches: user.role === mappedUserRole,

          businessId: user.businessId,
          branchId: user.branchId,
          isActive: user.isActive,
        });

        // --------------------------------------------------------------
        // STEP 8: RE-READ USER FROM DATABASE
        // --------------------------------------------------------------

        const savedUser = await tx.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            id: true,
            email: true,
            role: true,
            businessId: true,
            branchId: true,
            isActive: true,
            onboardingCompleted: true,
          },
        });

        this.debug("STEP 8 - USER DATABASE VERIFICATION", {
          userId: savedUser?.id,
          email: savedUser?.email,
          expectedRole: mappedUserRole,
          databaseRole: savedUser?.role,
          roleMatches: savedUser?.role === mappedUserRole,
        });

        if (!savedUser) {
          throw new Error(
            "User was created but could not be verified",
          );
        }

        // --------------------------------------------------------------
        // STEP 9: ACTIVATE EMPLOYEE AND LINK USER
        // --------------------------------------------------------------

        this.debug("STEP 9 - EMPLOYEE ACTIVATION STARTED", {
          employeeId: invitation.employeeId,
          userId: user.id,
        });

        const updatedEmployee = await tx.employee.update({
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

        this.debug("STEP 9 SUCCESS - EMPLOYEE ACTIVATED", {
          employeeId: updatedEmployee.id,
          linkedUserId: updatedEmployee.userId,
          employeeRole: updatedEmployee.role,
          employmentStatus: updatedEmployee.employmentStatus,
        });

        // --------------------------------------------------------------
        // STEP 10: FINAL ACCEPTANCE SUMMARY
        // --------------------------------------------------------------

        this.debug("STEP 10 - ACCEPTANCE COMPLETED", {
          invitationId: invitation.id,
          userId: user.id,
          employeeId: updatedEmployee.id,

          invitationRole,
          employeeRole,
          mappedUserRole,
          savedUserRole: savedUser.role,

          roleMatches: savedUser.role === mappedUserRole,

          email,
          completedAt: new Date().toISOString(),
        });

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
    } catch (error) {
      this.debugError("INVITATION ACCEPTANCE FAILED", {
        invitationId: data.invitationId,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });

      throw error;
    }
  }

  /**
   * Find an invitation by ID.
   */
  async findById(
    id: string,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<DomainEmployeeInvitation | null> {
    const row = await tx.employeeInvitation.findUnique({
      where: { id },
    });

    return row
      ? EmployeeInvitationMapper.fromRow(row)
      : null;
  }

  /**
   * Find all invitations belonging to an employee.
   */
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

  /**
   * Find all invitations belonging to a business.
   */
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

  /**
   * Update invitation status.
   */
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

  /**
   * Mark an invitation as accepted.
   */
  async accept(
    id: string,
    acceptedAt: number,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.update({
      where: { id },
      data: {
        status: EmployeeInvitationStatus.ACCEPTED,
        acceptedAt: EmployeeInvitationMapper.toDate(
          acceptedAt,
        ),
      },
    });
  }

  /**
   * Revoke an invitation.
   */
  async revoke(
    id: string,
    revokedAt: number,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<void> {
    await tx.employeeInvitation.update({
      where: { id },
      data: {
        status: EmployeeInvitationStatus.REVOKED,
        revokedAt: EmployeeInvitationMapper.toDate(
          revokedAt,
        ),
      },
    });
  }

  /**
   * Expire an invitation.
   */
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
   *
   * Must be called inside an existing transaction.
   */
  async claimForAcceptance(
    id: string,
    tokenHash: string,
    acceptedAt: number,
    tx: Prisma.TransactionClient,
  ): Promise<boolean> {
    const acceptedDate =
      EmployeeInvitationMapper.toDate(acceptedAt);

    const result = await tx.employeeInvitation.updateMany({
      where: {
        id,
        tokenHash,
        status: EmployeeInvitationStatus.PENDING,
        expiresAt: {
          gt: acceptedDate,
        },
      },
      data: {
        status: EmployeeInvitationStatus.ACCEPTED,
        acceptedAt: acceptedDate,
      },
    });

    return result.count === 1;
  }

  /**
   * Map an employee role to a user account role.
   */
  private mapEmployeeRoleToUserRole(
    employeeRole: PrismaEmployeeRole,
  ): Role {
    this.debug("ROLE MAPPER INPUT", {
      employeeRole,
    });

    switch (employeeRole) {
      case PrismaEmployeeRole.ADMIN:
        return Role.ADMIN;

      case PrismaEmployeeRole.CEO:
        return Role.CEO;

      case PrismaEmployeeRole.MANAGER:
        return Role.MANAGER;

      case PrismaEmployeeRole.SALES_REPS:
        return Role.SALES_REPS;

      case PrismaEmployeeRole.STAFF:
        return Role.STAFF;

      case PrismaEmployeeRole.CLEANER:
        return Role.CLEANER;

      default:
        this.debugError("UNSUPPORTED EMPLOYEE ROLE", {
          employeeRole,
        });

        throw new Error(
          `Unsupported employee role: ${employeeRole}`,
        );
    }
  }
}

/* -------------------------------------------------------------------------- */
/* EMPLOYEE INVITATION MAPPER                                                 */
/* -------------------------------------------------------------------------- */

export class EmployeeInvitationMapper {
  /**
   * Converts Unix milliseconds into a Prisma Date.
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
   * Converts nullable Unix milliseconds into a Prisma Date.
   */
  static toNullableDate(
    timestamp: number | null,
  ): Date | null {
    return timestamp === null
      ? null
      : this.toDate(timestamp);
  }

  /**
   * Converts a nullable Prisma Date into Unix milliseconds.
   */
  static fromNullableDate(
    date: Date | null,
  ): number | null {
    return date === null
      ? null
      : date.getTime();
  }

  /**
   * Maps domain role to Prisma EmployeeRole.
   */
  private static mapDomainRoleToPrisma(
    role: DomainEmployeeRole,
  ): PrismaEmployeeRole {
    switch (role) {
      case "ADMIN":
        return PrismaEmployeeRole.ADMIN;

      case "CEO":
        return PrismaEmployeeRole.CEO;

      case "MANAGER":
        return PrismaEmployeeRole.MANAGER;

      case "SALES_REPS":
        return PrismaEmployeeRole.SALES_REPS;

      case "STAFF":
        return PrismaEmployeeRole.STAFF;

      case "CLEANER":
        return PrismaEmployeeRole.CLEANER;

      default:
        throw new Error(
          `Unsupported domain employee role: ${role}`,
        );
    }
  }

  /**
   * Maps Prisma EmployeeRole to the shared domain role.
   */
  private static mapRole(
    role: PrismaEmployeeRole,
  ): DomainEmployeeRole {
    switch (role) {
      case PrismaEmployeeRole.ADMIN:
        return "ADMIN";

      case PrismaEmployeeRole.CEO:
        return "CEO";

      case PrismaEmployeeRole.MANAGER:
        return "MANAGER";

      case PrismaEmployeeRole.SALES_REPS:
        return "SALES_REPS";

      case PrismaEmployeeRole.STAFF:
        return "STAFF";

      case PrismaEmployeeRole.CLEANER:
        return "CLEANER";

      default:
        throw new Error(
          `Unsupported Prisma employee role: ${role}`,
        );
    }
  }

  /**
   * Maps domain invitation fields into Prisma update input.
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

      role: this.mapDomainRoleToPrisma(
        invitation.role,
      ),

      status: invitation.status,
      expiresAt: this.toNullableDate(
        invitation.expiresAt,
      ),
      acceptedAt: this.toNullableDate(
        invitation.acceptedAt,
      ),
      revokedAt: this.toNullableDate(
        invitation.revokedAt,
      ),
      updatedAt: this.toDate(
        invitation.updatedAt,
      ),
      version: invitation.version,
    };
  }

  /**
   * Maps a persisted Prisma invitation row into the domain model.
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

      role: this.mapRole(row.role),

      status: row.status,
      tokenHash: row.tokenHash,
      expiresAt: this.fromNullableDate(
        row.expiresAt,
      ),
      createdAt: row.createdAt.getTime(),
      acceptedAt: this.fromNullableDate(
        row.acceptedAt,
      ),
      revokedAt: this.fromNullableDate(
        row.revokedAt,
      ),
      updatedAt: row.updatedAt.getTime(),
      version: row.version,
    };
  }
}
