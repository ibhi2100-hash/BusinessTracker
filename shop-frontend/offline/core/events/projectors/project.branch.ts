import { AppDB } from "@/src/db";
import { BaseEvent } from "../types";
import { BranchReducer } from "../reducers/branchReducer";

export async function projectBranch(
  db: AppDB,
  event: BaseEvent
) {

  const current =
    await db.inventory.get(
      event.aggregateId
    );

  const next =
    BranchReducer.reduce(
      current,
      event
    );

  if (!next) {
    return;
  }

  await db.branches.put(next);
}