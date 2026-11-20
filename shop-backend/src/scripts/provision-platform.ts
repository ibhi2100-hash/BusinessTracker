import "dotenv/config";

import { prisma } from
    "../infrastructure/postgresql/prismaClient.js";

import { seedPlatformRbac } from "../modules/platform/identity/platform-identity.seed.js"; 
import { bootstrapFounder } from "../bootstrapper/platform-founder.bootstrap.js"; 
async function main(): Promise<void> {
    console.log("[PLATFORM] Starting provisioning...");

    try {
        // 1. Seed system roles and permissions.
        console.log("[PLATFORM] Seeding RBAC...");

        await seedPlatformRbac();

        // 2. Create initial founder.
        console.log("[PLATFORM] Creating founder account...");

        await bootstrapFounder();

        console.log("[PLATFORM] Provisioning completed.");
    } catch (error) {
        console.error("[PLATFORM] Provisioning failed:", error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

void main();