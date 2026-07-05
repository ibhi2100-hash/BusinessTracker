export const migration009 = `
CREATE TABLE IF NOT EXISTS products (

    id TEXT PRIMARY KEY,

    businessId TEXT,

    branchId  TEXT,
    
    name TEXT NOT NULL,

    imageUrl TEXT,

    description TEXT,

    costPrice INTEGER DEFAULT 0,

    price INTEGER DEFAULT 0,

    category TEXT,

    reorderLevel INTEGER DEFAULT 0,

    isActive  INTEGER DEFAULT 0,

    isDeleted INTEGER DEFAULT 0,

    createdAt TEXT NOT NULL,

    updatedAt TEXT,

    deletedAt TEXT

);

CREATE INDEX IF NOT EXISTS idx_product
ON products( businessId, branchId);

CREATE INDEX IF NOT EXISTS idx_product
ON products(createdAt);

CREATE INDEX IF NOT EXISTS idx_product
ON products(branchId);

`