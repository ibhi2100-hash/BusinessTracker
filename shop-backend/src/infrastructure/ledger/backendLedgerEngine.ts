// infrastructure/ledger/backendLedgerEngine.ts

import { LedgerEngine, generateLedgerEntries } from "@business/ledger-engine";
import { Prisma } from "../postgresql/prisma/generated/client.js";
import { PrismaLedgerRepo } from "../../modules/offlineSync/repository/PrismaLedgerRepo.js";

export function createBackendLedgerEngine(
  tx: Prisma.TransactionClient
) {
  const repo = new PrismaLedgerRepo(tx)

  return new LedgerEngine({
    ledgerRepository: repo,
    ledgerGenerator: generateLedgerEntries,
  });
}