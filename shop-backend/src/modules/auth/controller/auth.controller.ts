import type { Request, Response } from "express";
import { AuthService } from "../service/auth.service.js";
import {
  setAuthCookies,
  setRefreshCookie,
} from "../../../lib/cookies.js";

export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  async register(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const result =
        await this.authService.registerUser(
          req.body
        );

      if (!result) {
        return res.status(400).json({
          message: "Registration failed",
        });
      }

      const {
        user,
        accessToken: token,
        accessExpiresIn: expiresIn,
        refreshToken,
        refreshExpiresIn: refreshExpiresIn,
      } = result;

      setAuthCookies(
        res,
        token,
        refreshToken
      );

      return res.status(201).json({
        user: this.safeUser(user),
        accessToken: token,
        accessExpiresIn: expiresIn,
        refreshToken,
        refreshExpiresIn: refreshExpiresIn,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Email already in use"
      ) {
        return res.status(409).json({
          message: error.message,
        });
      }

      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  async login(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const ipAddress = req.ip;
      const userAgent =
        req.get("user-agent");

      const result =
        await this.authService.loginUser(
          req.body,
          {
            ...(ipAddress
              ? { ipAddress }
              : {}),
            ...(userAgent
              ? { userAgent }
              : {}),
          }
        );

      setRefreshCookie(
        res,
        result.refreshToken
      );

      return res.json({
        user: this.safeUser(
          result.user
        ),
        accessToken:
          result.accessToken,
        accessExpiresIn:
          result.accessExpiresIn,
        activeBranch:
          result.activeBranch,
        branches:
          result.branches,
        business:
          result.business,
      });
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "Login failed",
      });
    }
  }

  async refresh(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const refreshToken =
        req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          message:
            "Missing refresh token",
        });
      }

      const result =
        await this.authService.refreshSession(
          refreshToken
        );

      setRefreshCookie(
        res,
        result.refreshToken
      );

      return res.json({
        accessToken:
          result.accessToken,
        accessExpiresIn:
          result.accessExpiresIn,
        user: this.safeUser(
          result.user
        ),
      });
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "Refresh failed",
      });
    }
  }

  async logout(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const refreshToken =
        req.cookies.refreshToken;

      if (refreshToken) {
        await this.authService.logout(
          refreshToken
        );
      }

      res.clearCookie(
        "refreshToken",
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
        }
      );

      return res.json({
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Logout failed",
      });
    }
  }

  async me(
    req: any,
    res: Response
  ): Promise<Response> {
    try {
      const authUser =
        req.user;

      if (!authUser) {
        return res.status(401).json({
          message:
            "User does not exist",
        });
      }

      const result =
        await this.authService.getCurrentUser(
          authUser.id
        );

      return res.status(200).json({
        user: this.safeUser(
          result.user
        ),
        activeBranch:
          result.activeBranch,
        branches:
          result.branches,
        business:
          result.business,
      });
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "Invalid session",
      });
    }
  }

  private safeUser(user: any) {
    if (!user) return null;

    const {
      password,
      passwordHash,
      refreshToken,
      refreshTokenHash,
      ...safeUser
    } = user;

    return safeUser;
  }
}