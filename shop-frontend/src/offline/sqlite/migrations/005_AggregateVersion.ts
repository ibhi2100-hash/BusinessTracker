export const migration005 = `
CREATE TABLE IF NOT EXISTS aggregate_versions (

    aggregate_id TEXT NOT NULL,

    aggregate_type TEXT NOT NULL,

    current_version INTEGER NOT NULL,

    last_global_position INTEGER,

    updated_at TEXT NOT NULL,

    PRIMARY KEY (
        aggregate_type,
        aggregate_id
    )
);
`;