import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

import { promisify } from "node:util";
import { Prisma, PlatformUserStatus } from "../../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";

import { PlatformUserRepository } from "../repositories/platform-user.repository.js";
import { PlatformRoleRepository } from "../repositories/platform-role.repository.js";
import { PlatformPermissionRepository } from "../repositories/platform-permission.reposiitory.js"; 
import { PlatformUserRoleRepository } from "../repositories/platform-user-role.repository.js";
import { PlatformRolePermissionRepository } from "../repositories/platform-role-permission.repository.js";
import { PlatformSessionRepository } from "../repositories/platform-session.repository.js";
import { PlatformInvitationRepository } from "../repositories/platform-invitation.repository.js";


import { PlatformAuditService } from "../../audit/service/platform-audit.service.js"; 
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

type DbClient = Prisma.TransactionClient;

interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, passwordHash: string): Promise<boolean>;
}

export interface PlatformAccessTokenIssuer {
  issue(payload: {
    sub: string;
    sessionId: string;
  }): Promise<string>;
}

interface PlatformSessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
}

interface InviteUserInput {
  name: string;
  email: string;
  invitedByPlatformUserId: string;
  expiresInHours?: number;
}

interface PlatformInvitationDelivery {
  sendInvitation(input: {
    email: string;
    name: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;
}
interface LoginInput {
  email: string;
  password: string;
  metadata?: PlatformSessionMetadata;
}

const REFRESH_TOKEN_DAYS = 30;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

function assertPasswordStrength(password: string): void {
  if (password.length < 12) {
    throw new Error("Password must contain at least 12 characters");
  }

  if (password.length > 256) {
    throw new Error("Password is too long");
  }
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    assertPasswordStrength(password);

    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scrypt(password, salt, 64);

    return `scrypt:${salt}:${derivedKey.toString("hex")}`;
  }

  async verify(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    const [algorithm, salt, storedKey] = passwordHash.split(":");

    if (
      algorithm !== "scrypt" ||
      !salt ||
      !storedKey ||
      !/^[a-f0-9]+$/i.test(storedKey)
    ) {
      return false;
    }

    const derivedKey = await scrypt(password, salt, 64);
    const expectedKey = Buffer.from(storedKey, "hex");

    if (derivedKey.length !== expectedKey.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, expectedKey);
  }
}

export class PlatformIdentityService {
  private readonly passwordHasher: PasswordHasher;

  constructor(
    private readonly auditService: PlatformAuditService,
    private readonly accessTokenIssuer: PlatformAccessTokenIssuer,
    private readonly users = new PlatformUserRepository(),
    private readonly roles = new PlatformRoleRepository(),
    private readonly permissions = new PlatformPermissionRepository(),
    private readonly userRoles = new PlatformUserRoleRepository(),
    private readonly rolePermissions = new PlatformRolePermissionRepository(),
    private readonly sessions = new PlatformSessionRepository(),
    private readonly invitations = new PlatformInvitationRepository(),

    passwordHasher?: PasswordHasher
  ) {
    this.passwordHasher = passwordHasher ?? new ScryptPasswordHasher();
  }

  private async createAccessToken(
    platformUserId: string,
    sessionId: string
  ) {
    return this.accessTokenIssuer.issue({
      sub: platformUserId,
      sessionId,
    });
  }

  private getSessionExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + REFRESH_TOKEN_DAYS);
    return expiry;
  }

    private async getPermissionCodes(
    platformUserId: string,
    tx: DbClient
  ): Promise<string[]> {
    const now = new Date();

    const assignments = await tx.platformUserRole.findMany({
      where: {
        platformUserId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
        role: {
          isActive: true,
        },
      },
      select: {
        role: {
          select: {
            permissions: {
              select: {
                permission: {
                  select: {
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return [
      ...new Set(
        assignments.flatMap((assignment) =>
          assignment.role.permissions.map(
            (item) => item.permission.code
          )
        )
      ),
    ];
  }

  private async assertPermission(
    platformUserId: string,
    permissionCode: string,
    tx: DbClient
  ): Promise<void> {
    const user = await this.users.findById(platformUserId, tx);

    if (!user || user.status !== PlatformUserStatus.ACTIVE) {
      throw new Error("Active platform account required");
    }

    const codes = await this.getPermissionCodes(platformUserId, tx);

    if (!codes.includes(permissionCode)) {
      throw new Error(
        `You do not have permission to perform this operation: ${permissionCode}`
      );
    }
  }

  async hasPermission(
    platformUserId: string,
    permissionCode: string
  ): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const user = await this.users.findById(platformUserId, tx);

      if (!user || user.status !== PlatformUserStatus.ACTIVE) {
        return false;
      }

      const codes = await this.getPermissionCodes(platformUserId, tx);

      return codes.includes(permissionCode);
    });
  }

  async getMyPermissions(platformUserId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await this.users.findById(platformUserId, tx);

      if (!user || user.status !== PlatformUserStatus.ACTIVE) {
        throw new Error("Active platform account required");
      }

      return this.getPermissionCodes(platformUserId, tx);
    });
  }


async getMyAuthorization(platformUserId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.platformUser.findUnique({
      where: {
        id: platformUserId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!user || user.status !== PlatformUserStatus.ACTIVE) {
      throw new Error("Active platform account required");
    }

    const now = new Date();

    const assignments = await tx.platformUserRole.findMany({
      where: {
        platformUserId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
        role: {
          isActive: true,
        },
      },
      select: {
        role: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    const roles = assignments.map((assignment) => ({
      id: assignment.role.id,
      code: assignment.role.code,
      name: assignment.role.name,
    }));

    const permissions = await this.getPermissionCodes(
      platformUserId,
      tx
    );

    return {
      user,
      authorization: {
        roles,
        permissions,
      },
    };
  });
}


    async inviteUser(input: InviteUserInput) {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();

    if (!name || !email) {
      throw new Error("Name and email are required");
    }

    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date();

    expiresAt.setHours(
      expiresAt.getHours() + (input.expiresInHours ?? 48)
    );

    const result = await prisma.$transaction(
      async (tx) => {
        await this.assertPermission(
          input.invitedByPlatformUserId,
          "platform.users.invite",
          tx
        );

        let user = await this.users.findByEmail(email, tx);

        if (user && user.status !== PlatformUserStatus.INVITED) {
          throw new Error(
            "A platform account already exists for this email"
          );
        }

        if (!user) {
          user = await this.users.create(
            {
              name,
              email,
              status: PlatformUserStatus.INVITED,
              passwordHash: "",
            },
            tx
          );
        } else {
          await this.users.update(
            user.id,
            { name },
            tx
          );
        }

        const previousInvitation =
          await this.invitations.findPendingByEmail(email, tx);

        if (previousInvitation) {
          await this.invitations.revoke(
            previousInvitation.id,
            tx
          );
        }

        const invitation = await this.invitations.create(
          {
            email,
            name,
            tokenHash,
            expiresAt,
            invitedBy: {
              connect: {
                id: input.invitedByPlatformUserId,
              },
            },
          },
          tx
        );

        return {
          user,
          invitation,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return {
      user: result.user,
      invitation: {
        id: result.invitation.id,
        email: result.invitation.email,
        expiresAt: result.invitation.expiresAt,
      },
      invitationToken: rawToken,
    };
  }

   async acceptInvitation(input: {
    token: string;
    password: string;
  }) {
    if (!input.token) {
      throw new Error("Invitation token is required");
    }

    assertPasswordStrength(input.password);

    const passwordHash = await this.passwordHasher.hash(
      input.password
    );

    return prisma.$transaction(
      async (tx) => {
        const invitation =
          await this.invitations.findByTokenHash(
            hashToken(input.token),
            tx
          );

        if (!invitation) {
          throw new Error("Invalid invitation");
        }

        if (invitation.acceptedAt) {
          throw new Error("Invitation has already been accepted");
        }

        if (invitation.revokedAt) {
          throw new Error("Invitation has been revoked");
        }

        if (invitation.expiresAt <= new Date()) {
          throw new Error("Invitation has expired");
        }

        const user = await this.users.findByEmail(
          invitation.email,
          tx
        );

        if (
          !user ||
          user.status !== PlatformUserStatus.INVITED
        ) {
          throw new Error("Invited platform account is unavailable");
        }

        const now = new Date();

        const activatedUser = await this.users.update(
          user.id,
          {
            name: invitation.name ?? user.name,
            passwordHash,
            status: PlatformUserStatus.ACTIVE,
            emailVerifiedAt: now,
          },
          tx
        );

        await this.invitations.update(
          invitation.id,
          { acceptedAt: now },
          tx
        );

        return {
          id: activatedUser.id,
          name: activatedUser.name,
          email: activatedUser.email,
          status: activatedUser.status,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } 

    async login(input: LoginInput) {
    const email = normalizeEmail(input.email);

    const result = await prisma.$transaction(
      async (tx) => {
        const user = await this.users.findByEmail(email, tx);

        if (
          !user ||
          !user.passwordHash ||
          user.status !== PlatformUserStatus.ACTIVE
        ) {
          throw new Error("Invalid email or password");
        }

        const passwordValid = await this.passwordHasher.verify(
          input.password,
          user.passwordHash
        );

        if (!passwordValid) {
          throw new Error("Invalid email or password");
        }

        const refreshToken = createRefreshToken();

        const session = await this.sessions.create(
          {
            refreshTokenHash: hashToken(refreshToken),
            expiresAt: this.getSessionExpiry(),
            ipAddress: input.metadata?.ipAddress ?? null,
            userAgent: input.metadata?.userAgent ?? null,
            deviceName: input.metadata?.deviceName ?? null,
            user: {
              connect: { id: user.id },
            },
          },
          tx
        );

        await this.users.updateLastLogin(user.id, tx);

        return {
          user,
          session,
          refreshToken,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    const accessToken = await this.createAccessToken(
      result.user.id,
      result.session.id
    );

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        status: result.user.status,
      },
      accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.session.expiresAt,
    };
  }

    async refreshSession(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const oldHash = hashToken(refreshToken);
    const newRefreshToken = createRefreshToken();
    const newHash = hashToken(newRefreshToken);

    const result = await prisma.$transaction(
      async (tx) => {
        const session =
          await this.sessions.findByRefreshTokenHash(
            oldHash,
            tx
          );

        if (
          !session ||
          session.revokedAt ||
          session.expiresAt <= new Date()
        ) {
          throw new Error("Invalid or expired session");
        }

        if (session.user.status !== PlatformUserStatus.ACTIVE) {
          throw new Error("Platform account is not active");
        }

        const rotated = await this.sessions.rotateRefreshToken(
          session.id,
          oldHash,
          newHash,
          this.getSessionExpiry(),
          tx
        );

        if (rotated.count !== 1) {
          throw new Error("Session has already been rotated");
        }

        return {
          userId: session.user.id,
          sessionId: session.id,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    const accessToken = await this.createAccessToken(
      result.userId,
      result.sessionId
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

    async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    return prisma.$transaction(async (tx) => {
      const session =
        await this.sessions.findByRefreshTokenHash(
          hashToken(refreshToken),
          tx
        );

      if (!session) {
        return { revoked: false };
      }

      await this.sessions.revoke(session.id, tx);

      return { revoked: true };
    });
  }

  async revokeUserSessions(
    actorPlatformUserId: string,
    targetPlatformUserId: string
  ) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        actorPlatformUserId,
        "platform.users.sessions.revoke",
        tx
      );

      const user = await this.users.findById(
        targetPlatformUserId,
        tx
      );

      if (!user) {
        throw new Error("Platform user not found");
      }

      const result = await this.sessions.revokeAllForUser(
        targetPlatformUserId,
        tx
      );

      return {
        revokedSessions: result.count,
      };
    });
  }

    async createRole(input: {
    actorPlatformUserId: string;
    code: string;
    name: string;
    description?: string;
  }) {
    const code = input.code.trim().toUpperCase();

    if (!code || !input.name.trim()) {
      throw new Error("Role code and name are required");
    }

    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.roles.manage",
        tx
      );

      const existing = await this.roles.findByCode(code, tx);

      if (existing) {
        throw new Error("Role code already exists");
      }

      return this.roles.create(
        {
          code,
          name: input.name.trim(),
          description: input.description?.trim() ?? null,
          isSystem: false,
          isActive: true,
        },
        tx
      );
    });
  }

  async getRole(roleId: string) {
    return prisma.$transaction(async (tx) => {
      const role = await this.roles.findById(roleId, tx);

      if (!role) {
        throw new Error("Platform role not found");
      }

      return role;
    });
  }

  async listRoles(params?: {
    activeOnly?: boolean;
    skip?: number;
    take?: number;
  }) {
    return prisma.$transaction((tx) =>
      this.roles.findMany(params ?? {}, tx)
    );
  }

  async updateRole(input: {
    actorPlatformUserId: string;
    roleId: string;
    name?: string;
    description?: string | null;
    isActive?: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.roles.manage",
        tx
      );

      const role = await this.roles.findById(input.roleId, tx);

      if (!role) {
        throw new Error("Platform role not found");
      }

      if (role.isSystem && input.isActive === false) {
        throw new Error("System roles cannot be deactivated");
      }

      return this.roles.update(
        input.roleId,
        {
          ...(input.name !== undefined
            ? { name: input.name.trim() }
            : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.isActive !== undefined
            ? { isActive: input.isActive }
            : {}),
        },
        tx
      );
    });
  }

  async deleteRole(
    actorPlatformUserId: string,
    roleId: string
  ) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        actorPlatformUserId,
        "platform.roles.manage",
        tx
      );

      const role = await this.roles.findById(roleId, tx);

      if (!role) {
        throw new Error("Platform role not found");
      }

      if (role.isSystem) {
        throw new Error("System roles cannot be deleted");
      }

      if (role.users.length > 0) {
        throw new Error(
          "Remove this role from all users before deleting it"
        );
      }

      await this.roles.delete(roleId, tx);

      return { deleted: true };
    });
  }

    async createPermission(input: {
    actorPlatformUserId: string;
    code: string;
    name: string;
    module: string;
    description?: string;
  }) {
    const code = input.code.trim().toLowerCase();
    const module = input.module.trim().toLowerCase();

    if (!code || !module || !input.name.trim()) {
      throw new Error("Permission code, name and module are required");
    }

    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.permissions.manage",
        tx
      );

      const existing = await this.permissions.findByCode(code, tx);

      if (existing) {
        throw new Error("Permission code already exists");
      }

      return this.permissions.create(
        {
          code,
          name: input.name.trim(),
          module,
          description: input.description?.trim() ?? null,
        },
        tx
      );
    });
  }

  async listPermissions(params?: {
    module?: string;
    skip?: number;
    take?: number;
  }) {
    return prisma.$transaction((tx) =>
      this.permissions.findMany(params ?? {}, tx)
    );
  }

  async grantPermissionToRole(input: {
    actorPlatformUserId: string;
    roleId: string;
    permissionId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.roles.permissions.manage",
        tx
      );

      const role = await this.roles.findById(input.roleId, tx);
      const permission = await this.permissions.findById(
        input.permissionId,
        tx
      );

      if (!role || !permission) {
        throw new Error("Role or permission not found");
      }

      if (!role.isActive) {
        throw new Error("Cannot modify an inactive role");
      }

      const existing = await this.rolePermissions.findAssignment(
        input.roleId,
        input.permissionId,
        tx
      );

      if (existing) {
        return existing;
      }

      return this.rolePermissions.grant(
        {
          role: { connect: { id: input.roleId } },
          permission: { connect: { id: input.permissionId } },
        },
        tx
      );
    });
  }

  async revokePermissionFromRole(input: {
    actorPlatformUserId: string;
    roleId: string;
    permissionId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.roles.permissions.manage",
        tx
      );

      const role = await this.roles.findById(input.roleId, tx);

      if (!role) {
        throw new Error("Platform role not found");
      }

      return this.rolePermissions.revoke(
        input.roleId,
        input.permissionId,
        tx
      );
    });
  }

  async replaceRolePermissions(input: {
    actorPlatformUserId: string;
    roleId: string;
    permissionIds: string[];
  }) {
    const permissionIds = [...new Set(input.permissionIds)];

    return prisma.$transaction(
      async (tx) => {
        await this.assertPermission(
          input.actorPlatformUserId,
          "platform.roles.permissions.manage",
          tx
        );

        const role = await this.roles.findById(input.roleId, tx);

        if (!role) {
          throw new Error("Platform role not found");
        }

        if (!role.isActive) {
          throw new Error("Cannot modify an inactive role");
        }

        const existingPermissions =
          await this.permissions.findMany(
            { take: 1000 },
            tx
          );

        const availableIds = new Set(
          existingPermissions.map((permission) => permission.id)
        );

        const invalidIds = permissionIds.filter(
          (id) => !availableIds.has(id)
        );

        if (invalidIds.length > 0) {
          throw new Error(
            `Unknown permission IDs: ${invalidIds.join(", ")}`
          );
        }

        await this.rolePermissions.revokeAll(input.roleId, tx);

        if (permissionIds.length > 0) {
          await this.rolePermissions.grantMany(
            permissionIds.map((permissionId) => ({
              platformRoleId: input.roleId,
              permissionId,
            })),
            tx
          );
        }

        return this.rolePermissions.findByRoleId(
          input.roleId,
          tx
        );
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

    async assignRole(input: {
    actorPlatformUserId: string;
    platformUserId: string;
    platformRoleId: string;
    expiresAt?: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.roles.assign",
        tx
      );

      const user = await this.users.findById(
        input.platformUserId,
        tx
      );

      const role = await this.roles.findById(
        input.platformRoleId,
        tx
      );

      if (!user || !role) {
        throw new Error("Platform user or role not found");
      }

      if (user.status !== PlatformUserStatus.ACTIVE) {
        throw new Error("Role can only be assigned to an active user");
      }

      if (!role.isActive) {
        throw new Error("Cannot assign an inactive role");
      }

      if (
        input.expiresAt &&
        input.expiresAt <= new Date()
      ) {
        throw new Error("Role expiration must be in the future");
      }

      const existing = await this.userRoles.findAssignment(
        input.platformUserId,
        input.platformRoleId,
        tx
      );

      if (existing) {
        return existing;
      }

      return this.userRoles.assign(
        {
          assignedBy: input.actorPlatformUserId,
          ...(input.expiresAt !== undefined && { expiresAt: input.expiresAt }),
          user: {
            connect: { id: input.platformUserId },
          },
          role: {
            connect: { id: input.platformRoleId },
          },
        },
        tx
      );
    });
  }

  async revokeRole(input: {
    actorPlatformUserId: string;
    platformUserId: string;
    platformRoleId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.roles.assign",
        tx
      );

      const user = await this.users.findById(
        input.platformUserId,
        tx
      );

      if (!user) {
        throw new Error("Platform user not found");
      }

      return this.userRoles.revoke(
        input.platformUserId,
        input.platformRoleId,
        tx
      );
    });
  }

  async getUserRoles(platformUserId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await this.users.findById(platformUserId, tx);

      if (!user) {
        throw new Error("Platform user not found");
      }

      return this.userRoles.findByUserId(platformUserId, tx);
    });
  }

    async listUsers(
    actorPlatformUserId: string,
    params?: {
      status?: "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED";
      search?: string;
      skip?: number;
      take?: number;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        actorPlatformUserId,
        "platform.users.read",
        tx
      );

      return this.users.findMany(params ?? {}, tx);
    });
  }

  async updateUserStatus(input: {
    actorPlatformUserId: string;
    platformUserId: string;
    status: "ACTIVE" | "SUSPENDED" | "DISABLED";
    reason: string;
  }) {
    if (!input.reason.trim()) {
      throw new Error("A reason is required");
    }

    return prisma.$transaction(async (tx) => {
      await this.assertPermission(
        input.actorPlatformUserId,
        "platform.users.manage",
        tx
      );

      const user = await this.users.findById(
        input.platformUserId,
        tx
      );

      if (!user) {
        throw new Error("Platform user not found");
      }

      if (user.id === input.actorPlatformUserId) {
        throw new Error("You cannot change your own account status");
      }

      const updated = await this.users.updateStatus(
        input.platformUserId,
        input.status,
        tx
      );

      if (
        input.status === "SUSPENDED" ||
        input.status === "DISABLED"
      ) {
        await this.sessions.revokeAllForUser(
          input.platformUserId,
          tx
        );
      }

      return updated;
    });
  }

  async getUser(platformUserId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await this.users.findById(platformUserId, tx);

      if (!user) {
        throw new Error("Platform user not found");
      }

      return user;
    });
  }

    async validateAccessSession(
    platformUserId: string,
    sessionId: string
  ): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const session = await this.sessions.findById(sessionId, tx);

      if (!session) return false;

      if (session.platformUserId !== platformUserId) {
        return false;
      }

      if (session.revokedAt || session.expiresAt <= new Date()) {
        return false;
      }

      if (session.user.status !== PlatformUserStatus.ACTIVE) {
        return false;
      }

      return true;
    });
  }
}

