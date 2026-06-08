"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSnapshotRegistry = createSnapshotRegistry;
const SnapshotRegistry_1 = require("../contracts/SnapshotRegistry");
const productSnapshotReducer_1 = require("../../../../shop-frontend/offline/core/snapshots/snapshotReducer/productSnapshotReducer");
const inventorySnapshotReducer_1 = require("../../../../shop-frontend/offline/core/snapshots/snapshotReducer/inventorySnapshotReducer");
const businessSnapshotReducer_1 = require("../../../../shop-frontend/offline/core/snapshots/snapshotReducer/businessSnapshotReducer");
function createSnapshotRegistry() {
    const registry = new SnapshotRegistry_1.SnapshotRegistry();
    registry.register(productSnapshotReducer_1.ProductSnapshotReducer);
    registry.register(inventorySnapshotReducer_1.InventorySnapshotReducer);
    registry.register(businessSnapshotReducer_1.BusinessSnapshotReducer);
    return registry;
}
