import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js"; 

type DbClient = Prisma.TransactionClient;

export class PlatformInvitationRepository {

  async create(
    data: Prisma.PlatformInvitationCreateInput,
    tx: DbClient
  ) {
    return tx.platformInvitation.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.platformInvitation.findUnique({
      where: { id },
      include: { invitedBy: true },
    });
  }

  async findByTokenHash(tokenHash: string, tx: DbClient) {
    return tx.platformInvitation.findUnique({
      where: { tokenHash },
      include: { invitedBy: true },
    });
  }

  async findPendingByEmail(email: string, tx: DbClient) {
    return tx.platformInvitation.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findMany(
    params: {
      email?: string;
      skip?: number;
      take?: number;
    },
    tx: DbClient
  ) {
    const { email, skip = 0, take = 20 } = params;

    return tx.platformInvitation.findMany({
      where: email
        ? { email: email.toLowerCase().trim() }
        : {},
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.PlatformInvitationUpdateInput,
    tx: DbClient
  ) {
    return tx.platformInvitation.update({
      where: { id },
      data,
    });
  }

  async revoke(id: string, tx: DbClient) {
    return tx.platformInvitation.updateMany({
      where: {
        id,
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
}