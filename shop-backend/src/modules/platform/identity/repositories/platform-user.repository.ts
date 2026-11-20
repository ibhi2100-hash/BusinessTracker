import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 

type DbClient = Prisma.TransactionClient;

export class PlatformUserRepository {

    async create(
        data: Prisma.PlatformUserCreateInput,
        tx: DbClient
    ) {
        return tx.platformUser.create({ data });
    }

    async findById(id: string, tx: DbClient) {
    return tx.platformUser.findUnique({
        where: { id },
        select: {
        id: true,
        name: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        roles: {
            include: {
            role: {
                include: {
                permissions: {
                    include: {
                    permission: true,
                    },
                },
                },
            },
            },
        },
        },
    });
    }

    async findByEmail(email: string, tx: DbClient) {
        return tx.platformUser.findUnique({
        where: { email: email.toLowerCase().trim() },
        });
    }

    async findMany(
        params: {
        status?: "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED";
        search?: string;
        skip?: number;
        take?: number;
        },
        tx: DbClient
    ) {
        const { status, search, skip = 0, take = 20 } = params;

        return tx.platformUser.findMany({
        where: {
            ...(status ? { status } : {}),
            ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
                }
            : {}),
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            status: true,
            emailVerifiedAt: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            roles: {
            include: {
                role: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                },
                },
            },
            },
        },
        });
    }

    async update(
        id: string,
        data: Prisma.PlatformUserUpdateInput,
        tx: DbClient
    ) {
        return tx.platformUser.update({
        where: { id },
        data,
        });
    }

    async updateStatus(
    id: string,
    status: "ACTIVE" | "SUSPENDED" | "DISABLED",
    tx: DbClient
    ) {
    return tx.platformUser.update({
        where: { id },
        data: { status },
        select: {
        id: true,
        name: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        },
    });
    }

  async updateLastLogin(id: string, tx: DbClient) {
    return tx.platformUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async count(
    status?: "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED",
    tx?: DbClient
  ) {
    if (!tx) throw new Error("Transaction client is required");

    return tx.platformUser.count({
      where: status ? { status } : {},
    });
  }
}