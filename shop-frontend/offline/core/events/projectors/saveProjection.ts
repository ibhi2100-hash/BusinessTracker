import { AppDB } from "@/src/db";

export async function saveProjection(
  db: AppDB,
  target: string,
  state: any
) {

  switch (target) {

    case "products":

      await db.products.put(state, state.id);

      break;
    case "business":

      await db.businesses.put(state, state.id);

      break;
    case "branch":

      await db.branches.put(state, state.id);

      break;

    case "inventory":

      await db.inventory.put(state, state.id);

      break;
  }
}