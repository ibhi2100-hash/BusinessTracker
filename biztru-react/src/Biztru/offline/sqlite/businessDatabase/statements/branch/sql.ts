export const insert = 
    `
    INSERT INTO branches (
        id,
        businessId,
        name,
        address,
        phone,
        isActive,
        createdAt,
        isDefault
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(id)
    DO UPDATE SET
        name = excluded.name,
        address = excluded.address,
        phone = excluded.phone
    `

export const findById = 
    `
        SELECT *
        FROM branches
        WHERE id = ?
        LIMIT 1
    `
export const findAll = 
    `
        SELECT *
        FROM branches
        WHERE businessId = ?
        
    `