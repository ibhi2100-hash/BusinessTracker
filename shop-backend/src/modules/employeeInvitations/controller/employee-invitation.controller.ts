
import type { Request, Response } from "express";
import { EmployeeInvitationService } from "../service/employeeInvitation.service.js";

export class EmployeeInvitationController {
  constructor(
    private readonly invitationService: EmployeeInvitationService,
  ) {}

  async verify(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const token =
        typeof req.query.token === "string"
          ? req.query.token
          : "";

      const invitation =
        await this.invitationService.verify(token);

      return res.status(200).json({
        success: true,
        invitation,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify invitation";

      const status =
        message === "Invitation expired"
          ? 410
          : 400;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  }

  async accept(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const { token, password } = req.body ?? {};

      if (
        typeof token !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Token and password are required",
        });
      }

      const result =
        await this.invitationService.accept({
          token,
          password,
        });

      return res.status(201).json({
        success: true,
        message: "Employee account created successfully",
        user: result.user,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to accept invitation";

      if (message === "Email already registered") {
        return res.status(409).json({
          success: false,
          message,
        });
      }

      if (message === "Invitation expired") {
        return res.status(410).json({
          success: false,
          message,
        });
      }

      if (
        message === "Invalid or unavailable invitation"
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }
}
