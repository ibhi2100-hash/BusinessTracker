import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 
type DbClient = Prisma.TransactionClient;

export class PlatformPermissionRepository {

  async create(
    data: Prisma.PlatformPermissionCreateInput,
    tx: DbClient
  ) {
    return tx.platformPermission.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.platformPermission.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  async findByCode(code: string, tx: DbClient) {
    return tx.platformPermission.findUnique({
      where: { code: code.toLowerCase().trim() },
    });
  }

  async findMany(
    params: {
      module?: string;
      skip?: number;
      take?: number;
    },
    tx: DbClient
  ) {
    const { module, skip = 0, take = 100 } = params;

    return tx.platformPermission.findMany({
      where: module ? { module } : {},
      skip,
      take,
      orderBy: [
        { module: "asc" },
        { code: "asc" },
      ],
    });
  }

  async createMany(
    data: Prisma.PlatformPermissionCreateManyInput[],
    tx: DbClient
  ) {
    return tx.platformPermission.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async delete(id: string, tx: DbClient) {
    return tx.platformPermission.delete({
      where: { id },
    });
  }
}