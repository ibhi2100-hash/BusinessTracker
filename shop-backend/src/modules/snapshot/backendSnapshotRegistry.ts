import { SnapshotRegistry } from "@business/snapshot-engine";

import {
  ProductSnapshotReducer,
  InventorySnapshotReducer,
  BusinessSnapshotReducer,
  DashboardSnapshotReducer
} from "@business/domain-models";

export function createSnapshotRegistry() {

  const registry = new SnapshotRegistry();

  registry.register(ProductSnapshotReducer);
  registry.register(InventorySnapshotReducer);
  registry.register(BusinessSnapshotReducer);
  registry.register(DashboardSnapshotReducer);

  return registry;
}