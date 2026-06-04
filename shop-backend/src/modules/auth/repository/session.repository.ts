// session.repository.ts

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class SessionRepository {

  create(data: {
    userId: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({
      data,
    });
  }

  findByHash(
    refreshToken: string
  ) {
    return prisma.session.findUnique({
      where: {
        refreshToken,
      },
      include: {
        user: true,
      },
    });
  }

  revoke(sessionId: string) {
    return prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  delete(sessionId: string) {
    return prisma.session.delete({
      where: {
        id: sessionId,
      },
    });
  }

  rotate(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date
  ) {
    return prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        refreshTokenHash,
        expiresAt,
        lastUsedAt: new Date(),
      },
    });
  }
}