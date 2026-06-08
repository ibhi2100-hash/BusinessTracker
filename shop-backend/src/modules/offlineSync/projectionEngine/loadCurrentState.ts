import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { loaders } from "./TableAdapters.js";
export async function loadCurrentState(
  tx: Prisma.TransactionClient,
  target: string,
  aggregateId: string
) {

  const loader = loaders[target as keyof typeof loaders];

  if (!loader) {
    return null;
  }

  return loader(
    tx,
    aggregateId
  );
}