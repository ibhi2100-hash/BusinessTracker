import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";

type DbClient = Prisma.TransactionClient;

export class PlatformUserRoleRepository {

  async assign(
    data: Prisma.PlatformUserRoleCreateInput,
    tx: DbClient
  ) {
    return tx.platformUserRole.create({ data });
  }

  async assignMany(
    data: Prisma.PlatformUserRoleCreateManyInput[],
    tx: DbClient
  ) {
    return tx.platformUserRole.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findAssignment(
    platformUserId: string,
    platformRoleId: string,
    tx: DbClient
  ) {
    return tx.platformUserRole.findUnique({
      where: {
        platformUserId_platformRoleId: {
          platformUserId,
          platformRoleId,
        },
      },
    });
  }

  async findByUserId(platformUserId: string, tx: DbClient) {
    return tx.platformUserRole.findMany({
      where: { platformUserId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  async revoke(
    platformUserId: string,
    platformRoleId: string,
    tx: DbClient
  ) {
    return tx.platformUserRole.deleteMany({
      where: {
        platformUserId,
        platformRoleId,
      },
    });
  }

  async revokeAll(platformUserId: string, tx: DbClient) {
    return tx.platformUserRole.deleteMany({
      where: { platformUserId },
    });
  }
}