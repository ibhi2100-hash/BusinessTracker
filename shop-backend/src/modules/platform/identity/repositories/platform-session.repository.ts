import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 

type DbClient = Prisma.TransactionClient;

export class PlatformSessionRepository {

  async create(
    data: Prisma.PlatformSessionCreateInput,
    tx: DbClient
  ) {
    return tx.platformSession.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.platformSession.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
    tx: DbClient
  ) {
    return tx.platformSession.findUnique({
      where: { refreshTokenHash },
      include: {
        user: true,
      },
    });
  }

  async findActiveByUserId(
    platformUserId: string,
    now: Date,
    tx: DbClient
  ) {
    return tx.platformSession.findMany({
      where: {
        platformUserId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { lastUsedAt: "desc" },
    });
  }

  async rotateRefreshToken(
    id: string,
    oldHash: string,
    newHash: string,
    expiresAt: Date,
    tx: DbClient
  ) {
    return tx.platformSession.updateMany({
      where: {
        id,
        refreshTokenHash: oldHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        refreshTokenHash: newHash,
        expiresAt,
        lastUsedAt: new Date(),
      },
    });
  }

  async revoke(id: string, tx: DbClient) {
    return tx.platformSession.updateMany({
      where: {
        id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllForUser(platformUserId: string, tx: DbClient) {
    return tx.platformSession.updateMany({
      where: {
        platformUserId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async deleteExpired(now: Date, tx: DbClient) {
    return tx.platformSession.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });
  }
}