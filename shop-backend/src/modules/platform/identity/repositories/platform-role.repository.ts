import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 
type DbClient = Prisma.TransactionClient;

export class PlatformRoleRepository {

  async create(
    data: Prisma.PlatformRoleCreateInput,
    tx: DbClient
  ) {
    return tx.platformRole.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.platformRole.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findByCode(code: string, tx: DbClient) {
    return tx.platformRole.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
  }

  async findMany(
    params: {
      activeOnly?: boolean;
      skip?: number;
      take?: number;
    },
    tx: DbClient
  ) {
    const { activeOnly = false, skip = 0, take = 50 } = params;

    return tx.platformRole.findMany({
      where: activeOnly ? { isActive: true } : {},
      skip,
      take,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.PlatformRoleUpdateInput,
    tx: DbClient
  ) {
    return tx.platformRole.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, tx: DbClient) {
    return tx.platformRole.delete({
      where: { id },
    });
  }
}