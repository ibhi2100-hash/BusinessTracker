
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

import { EmployeeInvitationRepository } from "../repository/EmployeeInvitationRepository.js";

type AcceptInvitationInput = {
  token: string;
  password: string;
};

export class EmployeeInvitationService {
  constructor(
    private readonly invitationRepository:
      EmployeeInvitationRepository,
  ) {}

  private hashToken(token: string): string {
    return createHash("sha256")
      .update(token)
      .digest("hex");
  }

  async verify(token: string) {
    if (
      typeof token !== "string" ||
      token.length < 32 ||
      token.length > 512
    ) {
      throw new Error(
        "Invalid or unavailable invitation",
      );
    }

    const invitation =
      await this.invitationRepository.findByTokenHash(
        this.hashToken(token),
      );

    if (!invitation) {
      throw new Error(
        "Invalid or unavailable invitation",
      );
    }

    if (
      invitation.status === "EXPIRED" ||
      (
        invitation.expiresAt !== null &&
        invitation.expiresAt.getTime() <= Date.now()
      )
    ) {
      throw new Error("Invitation expired");
    }

    if (
      invitation.status !== "PENDING" ||
      !invitation.expiresAt
    ) {
      throw new Error(
        "Invalid or unavailable invitation",
      );
    }

    if (
      invitation.employee.employmentStatus !== "INVITED"
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

    return {
      employeeName: invitation.employee.fullName,
      email,
      businessName: invitation.business.name,
      branchName: invitation.branch?.name ?? null,
      role: invitation.role,
      expiresAt: invitation.expiresAt.toISOString(),
    };
  }

  async accept(input: AcceptInvitationInput) {
  const { token, password } = input;

  if (
    typeof token !== "string" ||
    token.length < 32 ||
    token.length > 512
  ) {
    throw new Error(
      "Invalid or unavailable invitation",
    );
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw new Error(
      "Password must be between 8 and 128 characters",
    );
  }

  const tokenHash = this.hashToken(token);

  // Verifies status and expiry, returning safe public details.
  await this.verify(token);

  const invitation =
    await this.invitationRepository.findByTokenHash(
      tokenHash,
    );

  if (!invitation) {
    throw new Error(
      "Invalid or unavailable invitation",
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  return this.invitationRepository.acceptInvitation({
    invitationId: invitation.id,
    tokenHash,
    passwordHash,
  });
}
}
