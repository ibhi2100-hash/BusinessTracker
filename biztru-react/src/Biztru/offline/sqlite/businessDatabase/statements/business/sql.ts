export const BUSINESS_UPSERT = 
      `
      INSERT INTO businesses (
        id,
        userId,
        name,
        address,
        createdAt,
        activatedAt,
        isOnboarding,
        onboardingCompleted,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        address = excluded.address
      `

export const FIND_BY_ID = 
                        `
                            SELECT *
                            FROM businesses
                            WHERE id = ?
                        `
export const FIND_All = 
  `
    SELECT * FROM businesses
  `
export const BUSINESS_DELETE=
                        `
                            DELETE FROM businesses
                            WHERE id = ?
                            
                        `

export const BUSINESS_ACTIVATION = `
    UPDATE businesses
    SET
        activatedAt = ?,
        status = ?,
        isOnboarding = ?,
        onboardingCompleted = ?
    WHERE id = ?
`;  
