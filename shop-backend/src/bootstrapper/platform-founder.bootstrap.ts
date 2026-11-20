import { prisma } from "../infrastructure/postgresql/prismaClient.js";
import { ScryptPasswordHasher } from "../modules/platform/identity/services/platform-indentity.service.js";

export async function bootstrapFounder(): Promise<void> {
  const email = process.env.PLATFORM_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const name = process.env.PLATFORM_BOOTSTRAP_NAME?.trim();
  const password = process.env.PLATFORM_BOOTSTRAP_PASSWORD;

  if (!email || !name || !password) {
    throw new Error(
      "PLATFORM_BOOTSTRAP_EMAIL, PLATFORM_BOOTSTRAP_NAME and PLATFORM_BOOTSTRAP_PASSWORD are required"
    );
  }

  const hasher = new ScryptPasswordHasher();
  const passwordHash = await hasher.hash(password);

  await prisma.$transaction(async (tx) => {
    const existingFounder = await tx.platformUser.findUnique({
      where: { email },
    });

    if (existingFounder) {
      throw new Error(
        "A platform account already exists for this email"
      );
    }

    const activeUsers = await tx.platformUser.count({
      where: { status: "ACTIVE" },
    });

    if (activeUsers > 0) {
      throw new Error(
        "Founder bootstrap is only permitted before the first active platform account exists"
      );
    }

    const founderRole = await tx.platformRole.findUnique({
      where: { code: "FOUNDER" },
    });

    if (!founderRole) {
      throw new Error(
        "FOUNDER role is missing. Run seedPlatformRbac first."
      );
    }

    const founder = await tx.platformUser.create({
      data: {
        name,
        email,
        passwordHash,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    await tx.platformUserRole.create({
      data: {
        platformUserId: founder.id,
        platformRoleId: founderRole.id,
      },
    });
  });
}