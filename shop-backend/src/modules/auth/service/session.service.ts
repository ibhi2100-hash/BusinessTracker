// session.service.ts

import { SessionRepository } from "../repository/session.repository.js";
import { TokenService } from "./token.service.js";
import { hashToken } from "../../../utils/crypto.util.js";

export class SessionService {
  constructor(
    private sessionRepo: SessionRepository,
    private tokenService: TokenService
  ) {}

  async createSession(
    user: any,
    ipAddress?: string,
    userAgent?: string
  ) {

    const refresh =
      this.tokenService.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        branchId: user.branchId,
      });

    await this.sessionRepo.create({
      userId: user.id,
      refreshToken: hashToken(refresh.token),
      ipAddress,
      userAgent,
      expiresAt: new Date(
        Date.now() +
          refresh.expiresIn * 1000
      ),
    });

    return refresh;
  }

async revoke(
  refreshToken: string
) {

  const hash =
    hashToken(refreshToken);

  const session =
    await this.sessionRepo.findByHash(
      hash
    );

  if (!session) {
    return;
  }

  await this.sessionRepo.revoke(
    session.id
  );
}
async refresh(
  refreshToken: string
) {

  const payload =
    this.tokenService.verifyRefreshToken(
      refreshToken
    );

  const tokenHash =
    hashToken(refreshToken);

  const session =
    await this.sessionRepo.findByHash(
      tokenHash
    );

  if (!session) {
    throw new Error("Invalid session");
  }

  if (session.revokedAt) {
    throw new Error("Session revoked");
  }

  if (session.expiresAt < new Date()) {
    throw new Error("Session expired");
  }

  const newRefresh =
    this.tokenService.generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      businessId: payload.businessId,
      branchId: payload.branchId,
    });

  await this.sessionRepo.rotate(
    session.id,
    hashToken(newRefresh.token),
    new Date(
      Date.now() +
      newRefresh.expiresIn * 1000
    )
  );

  const access =
    this.tokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      businessId: payload.businessId,
      branchId: payload.branchId,
    });

  return {
    user: session.user,

    accessToken:
      access.token,

    accessExpiresIn:
      access.expiresIn,

    refreshToken:
      newRefresh.token,

    refreshExpiresIn:
      newRefresh.expiresIn,
  };
}
}