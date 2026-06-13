import { SnapshotRegistry } from "@business/snapshot-engine";

import { ProductSnapshotReducer } from "@business/snapshot-engine";
import { BusinessSnapshotReducer } from "@business/snapshot-engine";
import { InventorySnapshotReducer } from "@business/snapshot-engine";
import { DashboardSnapshotReducer } from "@business/snapshot-engine";
export function createSnapshotRegistry() {

  const registry = new SnapshotRegistry();

  registry.register(ProductSnapshotReducer);
  registry.register(InventorySnapshotReducer);
  registry.register(BusinessSnapshotReducer);
  registry.register(DashboardSnapshotReducer);

  return registry;
}