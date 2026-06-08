import { savers } from "./TableAdapters.js"; 
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export async function saveProjection(
  tx: Prisma.TransactionClient,
  target: string,
  state: any
) {

  const saver = savers[target as keyof typeof savers];

  if (!saver) {
    throw new Error(
      `No projection saver registered for ${target}`
    );
  }

  await saver(
    tx,
    state
  );
}