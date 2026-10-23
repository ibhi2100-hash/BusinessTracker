
import type { Request, Response } from "express";
import { EmployeeInvitationService } from "../service/employeeInvitation.controller.js";

export class EmployeeInvitationController {
  constructor(
    private readonly invitationService: EmployeeInvitationService,
  ) {}

  async verify(req: Request, res: Response): Promise<Response> {
    try {
      const token =
        typeof req.query.token === "string"
          ? req.query.token
          : "";

      if (!token) {
        return res.status(400).json({
          message: "Invitation token is requ3ired",
        });
      }

      const invitation =
        await this.invitationService.verifyInvitation(token);

      return res.status(200).json({
        invitation,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify invitation",
      });
    }
  }

  async accept(req: Request, res: Response): Promise<Response> {
    try {
      const { token, password, name } = req.body ?? {};

      if (
        typeof token !== "string" ||
        typeof password !== "string" ||
        password.length < 8
      ) {
        return res.status(400).json({
          message:
            "A valid invitation token and password of at least 8 characters are required",
        });
      }

      const result = await this.invitationService.acceptInvitation({
        token,
        password,
        ...(typeof name === "string" && name.trim()
          ? { name: name.trim() }
          : {}),
      });

      return res.status(201).json({
        success: true,
        message: "Invitation accepted. You can now log in.",
        user: result.user,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to accept invitation";

      if (message === "Email already in use") {
        return res.status(409).json({ message });
      }

      if (
        message === "Invalid invitation" ||
        message === "Invitation expired" ||
        message === "Invitation already used"
      ) {
        return res.status(400).json({ message });
      }

      return res.status(400).json({ message });
    }
  }
}
