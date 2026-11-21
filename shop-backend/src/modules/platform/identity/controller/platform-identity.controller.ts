import type { Request, Response } from "express";

import { PlatformIdentityService } from "../services/platform-indentity.service.js"; 

interface AuthenticatedPlatformRequest extends Request {
  platformUser?: {
    id: string;
  };
}

export class PlatformIdentityController {
  constructor(
    private readonly identityService: PlatformIdentityService
  ) {}

  private getActor(req: AuthenticatedPlatformRequest): string {
    const id = req.platformUser?.id;

    if (!id) {
      throw new Error("PLATFORM_AUTH_REQUIRED");
    }

    return id;
  }

  private handleError(
    res: Response,
    error: unknown
  ): Response {
    const message =
      error instanceof Error
        ? error.message
        : "Platform identity operation failed";

    if (
      message === "PLATFORM_AUTH_REQUIRED"
    ) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (message.includes("do not have permission")) {
      return res.status(403).json({ message });
    }

    if (
      message.includes("Invalid email or password") ||
      message.includes("Invalid or expired session") ||
      message.includes("Invalid invitation")
    ) {
      return res.status(401).json({ message });
    }

    return res.status(400).json({ message });
  }

  private readonly refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/platform/identity",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  private setRefreshCookie(
    res: Response,
    token: string
  ): void {
    res.cookie(
      "platformRefreshToken",
      token,
      this.refreshCookieOptions
    );
  }

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const result = await this.identityService.login({
        email,
        password,
        metadata: {
          ...(req.ip !== undefined
            ? { ipAddress: req.ip }
            : {}),
          ...(req.get("user-agent")
            ? { userAgent: req.get("user-agent")! }
            : {}),
          ...(typeof req.body.deviceName === "string"
            ? { deviceName: req.body.deviceName }
            : {}),
        },
      });

      // Attach refresh token as an HttpOnly cookie.
      this.setRefreshCookie(res, result.refreshToken);

      return res.status(200).json({
        message: "Platform login successful",
        user: result.user,
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken =
        req.cookies?.platformRefreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          message: "Refresh token is missing or expired.",
        });
      }

      const result =
        await this.identityService.refreshSession(refreshToken);

      // Rotate the refresh token cookie.
      this.setRefreshCookie(res, result.refreshToken);

      return res.status(200).json({
        message: "Session refreshed successfully",
        accessToken: result.accessToken,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken =
        req.cookies?.platformRefreshToken;

      if (refreshToken) {
        await this.identityService.logout(refreshToken);
      }

      res.clearCookie(
        "platformRefreshToken",
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/platform/identity",
        }
      );

      return res.status(200).json({
        message: "Logged out successfully",
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async acceptInvitation(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          message: "Invitation token and password are required",
        });
      }

      const user = await this.identityService.acceptInvitation({
        token,
        password,
      });

      return res.status(200).json({
        message: "Platform invitation accepted",
        user,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // --------------------------------------------------
  // CURRENT PLATFORM USER
  // --------------------------------------------------

  
async me(
  req: AuthenticatedPlatformRequest,
  res: Response
): Promise<Response> {
  try {
    const result = await this.identityService.getMyAuthorization(
      this.getActor(req)
    );

    return res.status(200).json(result);
  } catch (error) {
    return this.handleError(res, error);
  }
}

  async myPermissions(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const permissions =
        await this.identityService.getMyPermissions(
          this.getActor(req)
        );

      return res.status(200).json({ permissions });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // --------------------------------------------------
  // PLATFORM USER MANAGEMENT
  // --------------------------------------------------

  async inviteUser(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { name, email, expiresInHours } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          message: "Name and email are required",
        });
      }

      const result = await this.identityService.inviteUser({
        name,
        email,
        invitedByPlatformUserId: this.getActor(req),
        expiresInHours,
      });

      return res.status(201).json({
        message: "Platform invitation created",
        user: result.user,
        invitation: result.invitation,

        // Pass this to your email delivery service.
        // Do not expose it in general user listings.
        invitationToken: result.invitationToken,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async listUsers(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const users = await this.identityService.listUsers(
        this.getActor(req),
        {
          ...(req.query.status !== undefined && {
            status: req.query.status as
              | "INVITED"
              | "ACTIVE"
              | "SUSPENDED"
              | "DISABLED",
          }),
          ...(req.query.search !== undefined && {
            search: req.query.search as string,
          }),
          skip: Number(req.query.skip ?? 0),
          take: Number(req.query.take ?? 20),
        }
      );

      return res.status(200).json({ users });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateUserStatus(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { status, reason } = req.body;

      if (!status || !reason) {
        return res.status(400).json({
          message: "Status and reason are required",
        });
      }

      const user = await this.identityService.updateUserStatus({
        actorPlatformUserId: this.getActor(req),
        platformUserId: String(req.params.userId),
        status,
        reason,
      });

      return res.status(200).json({
        message: "Platform user status updated",
        user,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async revokeUserSessions(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const result = await this.identityService.revokeUserSessions(
        this.getActor(req),
        String(req.params.userId)
      );

      return res.status(200).json({
        message: "Platform sessions revoked",
        ...result,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // --------------------------------------------------
  // ROLE MANAGEMENT
  // --------------------------------------------------

  async createRole(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const role = await this.identityService.createRole({
        actorPlatformUserId: this.getActor(req),
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
      });

      return res.status(201).json({
        message: "Platform role created",
        role,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async listRoles(
    _req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const roles = await this.identityService.listRoles({
        activeOnly: false,
      });

      return res.status(200).json({ roles });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getRole(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const role = await this.identityService.getRole(
        String(req.params.roleId)
      );

      return res.status(200).json({ role });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateRole(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const role = await this.identityService.updateRole({
        actorPlatformUserId: this.getActor(req),
        roleId: String(req.params.roleId),
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive,
      });

      return res.status(200).json({
        message: "Platform role updated",
        role,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async deleteRole(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const result = await this.identityService.deleteRole(
        this.getActor(req),
        String(req.params.roleId)
      );

      return res.status(200).json({
        message: "Platform role deleted",
        ...result,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // --------------------------------------------------
  // PERMISSION MANAGEMENT
  // --------------------------------------------------

  async createPermission(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const permission =
        await this.identityService.createPermission({
          actorPlatformUserId: this.getActor(req),
          code: req.body.code,
          name: req.body.name,
          module: req.body.module,
          description: req.body.description,
        });

      return res.status(201).json({
        message: "Platform permission created",
        permission,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async listPermissions(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const permissions =
        await this.identityService.listPermissions({
          ...(req.query.module !== undefined && {
            module: req.query.module as string,
          }),
        });

      return res.status(200).json({ permissions });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async grantPermission(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const result =
        await this.identityService.grantPermissionToRole({
          actorPlatformUserId: this.getActor(req),
          roleId: String(req.params.roleId),
          permissionId: req.body.permissionId,
        });

      return res.status(200).json({
        message: "Permission granted to role",
        assignment: result,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async revokePermission(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const result =
        await this.identityService.revokePermissionFromRole({
          actorPlatformUserId: this.getActor(req),
          roleId: String(req.params.roleId),
          permissionId: String(req.params.permissionId),
        });

      return res.status(200).json({
        message: "Permission revoked from role",
        result,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async replaceRolePermissions(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      if (!Array.isArray(req.body.permissionIds)) {
        return res.status(400).json({
          message: "permissionIds must be an array",
        });
      }

      const permissions =
        await this.identityService.replaceRolePermissions({
          actorPlatformUserId: this.getActor(req),
          roleId: String(req.params.roleId),
          permissionIds: req.body.permissionIds,
        });

      return res.status(200).json({
        message: "Role permissions updated",
        permissions,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // --------------------------------------------------
  // USER ROLE ASSIGNMENTS
  // --------------------------------------------------

  async assignRole(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const assignment = await this.identityService.assignRole({
        actorPlatformUserId: this.getActor(req),
        platformUserId: String(req.params.userId),
        platformRoleId: req.body.platformRoleId,
        ...(req.body.expiresAt
          ? { expiresAt: new Date(req.body.expiresAt) }
          : {}),
      });

      return res.status(201).json({
        message: "Role assigned to platform user",
        assignment,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async revokeRole(
    req: AuthenticatedPlatformRequest,
    res: Response
  ): Promise<Response> {
    try {
      const result = await this.identityService.revokeRole({
        actorPlatformUserId: this.getActor(req),
        platformUserId: String(req.params.userId),
        platformRoleId: String(req.params.roleId),
      });

      return res.status(200).json({
        message: "Role revoked from platform user",
        result,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getUserRoles(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const roles = await this.identityService.getUserRoles(
        String(req.params.userId)
      );

      return res.status(200).json({ roles });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}