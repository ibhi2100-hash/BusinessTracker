import { AppDB } from "../db";

export async function nextLogicClock(
  db: AppDB,
  deviceId: string
) {

  const meta =
    await db.replicaMeta.get(deviceId);

  const lastLogicClock = meta?.lastLogicClock ?? 0;
  const next = lastLogicClock + 1;

  await db.replicaMeta.put({
    deviceId,
    lastLogicClock: next,
  });

  return next;
}