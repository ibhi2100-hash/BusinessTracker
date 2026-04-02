import { addRecord } from "../db/helpers";
import { TABLES } from "../db/schema";
import { getRecord, deleteRecord } from "../db/helpers";


export async function saveSession({
  userId,
  accessToken,
  expiresIn,
}: {
  userId: string;
  accessToken: string;
  expiresIn: number;
}) {
  const expiresAt = Date.now() + expiresIn * 1000;

  await addRecord(TABLES.SESSION, {
    id: "active",
    userId,
    accessToken,
    expiresAt,
  });
}


export interface Session {
  userId: string;
  accessToken: string;
  expiresAt: number;
}

export async function loadSession(): Promise<Session | null> {
  const session = await getRecord(TABLES.SESSION, "active");

  // 1️⃣ No session
  if (!session) return null;

  // 2️⃣ Expired → clean up
  if (Date.now() >= session.expiresAt) {
    await deleteRecord(TABLES.SESSION, "active");
    return null;
  }

  return session;
}