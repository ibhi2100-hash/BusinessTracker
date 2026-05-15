import { AppDB } from "@/src/db";
import { BaseEvent } from "../types";
import { BusinessReducer } from "../reducers/businessReducer";

export async function projectBusiness(
  db: AppDB,
  event: BaseEvent
) {

  const current =
    await db.businesses.get(
      event.aggregateId
    );

  const next =
    BusinessReducer.reduce(
      current,
      event
    );

  if (!next) {
    return;
  }

  await db.businesses.put(next);
}