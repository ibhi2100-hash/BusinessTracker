import type { Request, Response } from "express";
import { AuthService } from "../service/auth.service.js";
import { LoginDto } from "../dto/login.dto.js";
import { setAuthCookies } from "../../../lib/cookies.js"


export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.authService.registerUser(req.body);

      if (!result) {
        return res.status(400).json({ message: "Registration failed" });
      }

      const { user, token, expiresIn, refreshToken, refreshExpiresIn } = result;

      setAuthCookies(res, token, refreshToken);

      return res.status(201).json({
        user: this.safeUser(user),
        accessToken: token,
        expiresIn,
        refreshToken,
        refreshExpiresIn,
      });

    } catch (error: any) {
      if (error.message === "Email already in use") {
        return res.status(409).json({ message: error.message });
      }

      return res.status(400).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async login(
  req: Request,
  res: Response
) {

  const result =
    await this.authService.loginUser(
      req.body,
      {
        ipAddress:
          req.ip,
        userAgent:
          req.get("user-agent")
      }
    );

  setRefreshCookie(
    res,
    result.refreshToken
  );

  return res.json({
    user:
      this.safeUser(
        result.user
      ),

    accessToken:
      result.accessToken,

    expiresIn:
      result.accessExpiresIn,

    activeBranch:
      result.activeBranch,

    branches:
      result.branches,

    business:
      result.business
  });
}
async refresh(
  req: Request,
  res: Response
) {

  const refreshToken =
    req.cookies.refresh_token;

  if (!refreshToken) {
    return res
      .status(401)
      .json({
        message:
          "Missing refresh token"
      });
  }

  const result =
    await this.authService
      .refreshSession(
        refreshToken
      );

  setRefreshCookie(
    res,
    result.refreshToken
  );

  return res.json({
    accessToken:
      result.accessToken,

    expiresIn:
      result.accessExpiresIn,

    user:
      this.safeUser(
        result.user
      )
  });
}
  async logout(
  req: Request,
  res: Response
) {

  const refreshToken =
    req.cookies.refresh_token;

  if (refreshToken) {
    await this.authService.logout(
      refreshToken
    );
  }

  res.clearCookie(
    "refresh_token"
  );

  return res.json({
    success: true
  });
}

  async me(req: any, res: Response): Promise<Response> {
  try {
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const result = await this.authService.getCurrentUser(
      authUser.id
    );

    return res.status(200).json({
      user: this.safeUser(result.user),
      activeBranch: result.activeBranch,
      branches: result.branches,
      business: result.business,
    });
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || "Invalid session",
    });
  }
}
}
