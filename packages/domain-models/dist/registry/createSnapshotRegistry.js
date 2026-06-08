"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSnapshotRegistry = createSnapshotRegistry;
// domain-models/createSnapshotRegistry.ts
const snapshot_engine_1 = require("@business/snapshot-engine");
const domain_models_1 = require("@business/domain-models");
function createSnapshotRegistry() {
    const registry = new snapshot_engine_1.SnapshotRegistry();
    registry.register(domain_models_1.ProductReducer);
    registry.register(domain_models_1.InventoryReducer);
    registry.register(domain_models_1.BusinessReducer);
    registry.register(domain_models_1.DashboardReducer);
    registry.register(CashbookReducer);
    return registry;
}
