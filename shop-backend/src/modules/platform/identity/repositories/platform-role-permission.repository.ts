import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 
type DbClient = Prisma.TransactionClient;

export class PlatformRolePermissionRepository {

  async grant(
    data: Prisma.PlatformRolePermissionCreateInput,
    tx: DbClient
  ) {
    return tx.platformRolePermission.create({ data });
  }

  async grantMany(
    data: Prisma.PlatformRolePermissionCreateManyInput[],
    tx: DbClient
  ) {
    return tx.platformRolePermission.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findAssignment(
    platformRoleId: string,
    permissionId: string,
    tx: DbClient
  ) {
    return tx.platformRolePermission.findUnique({
      where: {
        platformRoleId_permissionId: {
          platformRoleId,
          permissionId,
        },
      },
    });
  }

  async findByRoleId(platformRoleId: string, tx: DbClient) {
    return tx.platformRolePermission.findMany({
      where: { platformRoleId },
      include: { permission: true },
    });
  }

  async revoke(
    platformRoleId: string,
    permissionId: string,
    tx: DbClient
  ) {
    return tx.platformRolePermission.deleteMany({
      where: {
        platformRoleId,
        permissionId,
      },
    });
  }

  async revokeAll(platformRoleId: string, tx: DbClient) {
    return tx.platformRolePermission.deleteMany({
      where: { platformRoleId },
    });
  }
}