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

  async login(req: Request, res: Response): Promise<Response> {
    const dto: LoginDto = req.body;

    try {
      const result = await this.authService.loginUser(dto);

      if (!result) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const { user, token, expiresIn, refreshToken, refreshExpiresIn, branches, activeBranch } = result;

      setAuthCookies(res, token, refreshToken);

      return res.status(200).json({
        user: this.safeUser(user),
        accessToken: token,
        expiresIn,
        refreshToken,
        refreshExpiresIn,
        activeBranch,
        branches, // enables branch switch UI immediately
      });

    } catch (error: any) {
      if (
        error.message === "User not found" ||
        error.message === "Invalid password"
      ) {
        return res.status(401).json({ message: error.message });
      }

      return res.status(500).json({
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token");
    return res.json({ message: "Logged out" });
  }


  private safeUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      businessId: user.businessId,
    };
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
