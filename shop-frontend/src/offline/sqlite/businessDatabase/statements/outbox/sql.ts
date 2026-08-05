const GET_PENDING = `
    SELECT e.*, o.*
    FROM outbox o
    JOIN events e ON e.id = o.event_id
    WHERE o.status = 'PENDING' AND (o.next_retry_at IS NULL OR o.next_retry_at <= ?)
    LIMIT 100;
`