import { AppDB } from "../db";

export async function nextLogicClock(
  db: AppDB,
  deviceId: string
) {

  const meta =
    await db.replicaMeta.get(deviceId);

  const lastLogicClock = meta?.lastLogicClock ?? 0;
  const next = BigInt(lastLogicClock) + BigInt(1);

  await db.replicaMeta.put({
    deviceId,
    lastLogicClock: next,
  });

  return next;
}