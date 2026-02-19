import type { Request, Response } from "express";
import { AuthService } from "../service/auth.service.js";
import { LoginDto } from "../dto/login.dto.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.authService.registerUser(req.body);

      if (!result) {
        return res.status(400).json({ message: "Registration failed" });
      }

      const { user, token } = result;

      this.setAuthCookie(res, token);

      return res.status(201).json({
        user: this.safeUser(user),
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

      const { user, token, branches, activeBranch } = result;

      this.setAuthCookie(res, token);

      return res.status(200).json({
        user: this.safeUser(user),
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

  // centralize cookie logic
  private setAuthCookie(res: Response, token: string) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });
  }

  private safeUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    };
  }
}
