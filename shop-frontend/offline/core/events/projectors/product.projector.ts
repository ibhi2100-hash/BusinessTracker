import { ProductReducer } from "../reducers/productReducer";

export async function projectProduct(
  db,
  event
) {

  const current =
    await db.products.get(
      event.aggregateId
    );

  const next =
    ProductReducer.reduce(
      current,
      event
    );

  if (!next) {
    return;
  }

  await db.products.put(next);
}