export const migration010 = `
CREATE TABLE IF NOT EXISTS inventories (

    id TEXT PRIMARY KEY,

    productId TEXT,
    
    branchId TEXT,

    businessId  TEXT,

    quantity INTEGER DEFAULT 0,

    costPrice  INTEGER DEFAULT 0,

    createdAt TEXT NOT NULL,
    updatedAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_inventory
ON inventories(businessId, branchId);

CREATE INDEX IF NOT EXISTS idx_inventory
ON inventories(productId, createdAt);

CREATE INDEX IF NOT EXISTS idx_inventory
ON inventories(productId, quantity);
`