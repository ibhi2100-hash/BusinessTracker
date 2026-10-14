
export const EMPLOYEE_SQL = {
  // =========================================================
  // EMPLOYEES
  // =========================================================

  INSERT: `
    INSERT INTO employees (
      id, businessId, branchId, userId, reportsToEmployeeId,
      employeeNumber, fullName, phone, email, role,
      employmentStatus, joinedAt, createdAt, updatedAt, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,

  UPDATE: `
    UPDATE employees
    SET businessId = ?, branchId = ?, userId = ?,
        reportsToEmployeeId = ?, employeeNumber = ?,
        fullName = ?, phone = ?, email = ?, role = ?,
        employmentStatus = ?, joinedAt = ?,
        updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  FIND_BY_ID: `
    SELECT * FROM employees WHERE id = ?;
  `,

  FIND_BY_BUSINESS: `
    SELECT * FROM employees
    WHERE businessId = ?
    ORDER BY createdAt ASC;
  `,

  FIND_BY_BRANCH: `
    SELECT * FROM employees
    WHERE businessId = ? AND branchId = ?
    ORDER BY createdAt ASC;
  `,

  FIND_BY_USER: `
    SELECT * FROM employees
    WHERE userId = ?
    ORDER BY createdAt ASC;
  `,

  FIND_REPORTS: `
    SELECT * FROM employees
    WHERE reportsToEmployeeId = ?
    ORDER BY createdAt ASC;
  `,

  // Maintenance-only. Normal employee removal should be a status transition.
  DELETE: `
    DELETE FROM employees WHERE id = ?;
  `,

  UPDATE_STATUS: `
    UPDATE employees
    SET employmentStatus = ?, updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  UPDATE_USER: `
    UPDATE employees
    SET userId = ?, updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  UPDATE_JOINED: `
    UPDATE employees
    SET joinedAt = ?, updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  UPDATE_ROLE: `
    UPDATE employees
    SET role = ?, updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  UPDATE_BRANCH: `
    UPDATE employees
    SET branchId = ?, updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  UPDATE_REPORTS_TO: `
    UPDATE employees
    SET reportsToEmployeeId = ?, updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  // =========================================================
  // EMPLOYEE INVITATIONS
  // =========================================================

  INSERT_INVITATION: `
    INSERT INTO employee_invitations (
      id, businessId, employeeId, branchId, email, phone,
      role, status, expiresAt, createdAt, acceptedAt,
      revokedAt, updatedAt, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,

  UPDATE_INVITATION: `
    UPDATE employee_invitations
    SET businessId = ?, employeeId = ?, branchId = ?,
        email = ?, phone = ?, role = ?, status = ?,
        expiresAt = ?, acceptedAt = ?, revokedAt = ?,
        updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  FIND_INVITATION_BY_ID: `
    SELECT * FROM employee_invitations WHERE id = ?;
  `,

  FIND_INVITATIONS_BY_EMPLOYEE: `
    SELECT * FROM employee_invitations
    WHERE employeeId = ?
    ORDER BY createdAt DESC;
  `,

  FIND_INVITATIONS_BY_BUSINESS: `
    SELECT * FROM employee_invitations
    WHERE businessId = ?
    ORDER BY createdAt DESC;
  `,

  // Only pending invitations may be expired.
  EXPIRE_INVITATION: `
    UPDATE employee_invitations
    SET status = 'EXPIRED', updatedAt = ?, version = ?
    WHERE id = ?
      AND status = 'PENDING'
      AND expiresAt IS NOT NULL
      AND expiresAt <= ?;
  `,

  UPDATE_INVITATION_STATUS: `
    UPDATE employee_invitations
    SET status = ?, updatedAt = ?, version = ?
    WHERE id = ? AND status = 'PENDING';
  `,

  // The caller must validate the invitation token before executing this.
  // This SQL additionally prevents acceptance after expiry or revocation.
  ACCEPT_INVITATION: `
    UPDATE employee_invitations
    SET status = 'ACCEPTED',
        acceptedAt = ?,
        updatedAt = ?,
        version = ?
    WHERE id = ?
      AND status = 'PENDING'
      AND (expiresAt IS NULL OR expiresAt > ?);
  `,

  REVOKE_INVITATION: `
    UPDATE employee_invitations
    SET status = 'REVOKED',
        revokedAt = ?,
        updatedAt = ?,
        version = ?
    WHERE id = ? AND status = 'PENDING';
  `,

// =========================================================
    // EMPLOYEE REQUESTS
    // =========================================================

    INSERT_REQUEST: `
        INSERT INTO employee_requests (
            id,
            businessId,
            branchId,
            requesterEmployeeId,
            assignedToEmployeeId,
            type,
            title,
            description,
            status,
            priority,
            amount,
            currency,
            submittedAt,
            resolvedAt,
            resolutionNote,
            createdAt,
            updatedAt,
            version
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,

    UPDATE_REQUEST: `
        UPDATE employee_requests
        SET
            businessId = ?,
            branchId = ?,
            requesterEmployeeId = ?,
            assignedToEmployeeId = ?,
            type = ?,
            title = ?,
            description = ?,
            status = ?,
            priority = ?,
            amount = ?,
            currency = ?,
            submittedAt = ?,
            resolvedAt = ?,
            resolutionNote = ?,
            updatedAt = ?,
            version = ?
        WHERE id = ?;
    `,

    FIND_REQUEST_BY_ID: `
        SELECT
            id,
            businessId,
            branchId,
            requesterEmployeeId,
            assignedToEmployeeId,
            type,
            title,
            description,
            status,
            priority,
            amount,
            currency,
            submittedAt,
            resolvedAt,
            resolutionNote,
            createdAt,
            updatedAt,
            version
        FROM employee_requests
        WHERE id = ?;
    `,

    FIND_REQUESTS_BY_BUSINESS: `
        SELECT
            id,
            businessId,
            branchId,
            requesterEmployeeId,
            assignedToEmployeeId,
            type,
            title,
            description,
            status,
            priority,
            amount,
            currency,
            submittedAt,
            resolvedAt,
            resolutionNote,
            createdAt,
            updatedAt,
            version
        FROM employee_requests
        WHERE businessId = ?
        ORDER BY createdAt DESC;
    `,

    FIND_REQUESTS_BY_BRANCH: `
        SELECT
            id,
            businessId,
            branchId,
            requesterEmployeeId,
            assignedToEmployeeId,
            type,
            title,
            description,
            status,
            priority,
            amount,
            currency,
            submittedAt,
            resolvedAt,
            resolutionNote,
            createdAt,
            updatedAt,
            version
        FROM employee_requests
        WHERE businessId = ?
          AND branchId = ?
        ORDER BY createdAt DESC;
    `,

    FIND_REQUESTS_BY_ASSIGNEE: `
        SELECT
            id,
            businessId,
            branchId,
            requesterEmployeeId,
            assignedToEmployeeId,
            type,
            title,
            description,
            status,
            priority,
            amount,
            currency,
            submittedAt,
            resolvedAt,
            resolutionNote,
            createdAt,
            updatedAt,
            version
        FROM employee_requests
        WHERE assignedToEmployeeId = ?
        ORDER BY createdAt DESC;
    `,

    FIND_REQUESTS_BY_STATUS: `
        SELECT
            id,
            businessId,
            branchId,
            requesterEmployeeId,
            assignedToEmployeeId,
            type,
            title,
            description,
            status,
            priority,
            amount,
            currency,
            submittedAt,
            resolvedAt,
            resolutionNote,
            createdAt,
            updatedAt,
            version
        FROM employee_requests
        WHERE businessId = ?
          AND status = ?
        ORDER BY createdAt DESC;
    `,

     UPDATE_REQUEST_ASSIGNMENT: `
        UPDATE employee_requests
        SET
            assignedToEmployeeId = ?,
            updatedAt = ?,
            version = ?
        WHERE id = ?;
    `,

    UPDATE_REQUEST_RESOLUTION: `
        UPDATE employee_requests
        SET
            status = ?,
            resolvedAt = ?,
            resolutionNote = ?,
            updatedAt = ?,
            version = ?
        WHERE id = ?;
    `,

  
  // =========================================================
  // EMPLOYEE NOTIFICATIONS
  // Matches migration021 exactly
  // =========================================================

  INSERT_NOTIFICATION: `
    INSERT INTO employee_notifications (
      id,
      businessId,
      employeeId,
      type,
      title,
      message,
      referenceType,
      referenceId,
      read,
      createdAt,
      readAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,

  MARK_NOTIFICATION_READ: `
    UPDATE employee_notifications
    SET read = 1,
        readAt = ?
    WHERE id = ?
      AND employeeId = ?
      AND read = 0;
  `,

  FIND_NOTIFICATIONS_BY_EMPLOYEE: `
    SELECT *
    FROM employee_notifications
    WHERE employeeId = ?
    ORDER BY createdAt DESC, id DESC;
  `,

  FIND_UNREAD_NOTIFICATIONS: `
    SELECT *
    FROM employee_notifications
    WHERE employeeId = ?
      AND read = 0
    ORDER BY createdAt DESC, id DESC;
  `,

  RESET_NOTIFICATIONS: `
    DELETE FROM employee_notifications;
  `,


  // =========================================================
  // CURRENT COMPENSATION
  // =========================================================

  UPSERT_COMPENSATION: `
    INSERT INTO employee_compensation (
      id, businessId, employeeId, branchId, currency,
      payFrequency, baseSalary, housingAllowance,
      transportAllowance, mealAllowance, otherAllowance,
      employerPension, employerTax, otherEmployerCost,
      commissionRate, effectiveFrom, effectiveTo,
      createdAt, updatedAt, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(employeeId) DO UPDATE SET
      id = excluded.id,
      businessId = excluded.businessId,
      branchId = excluded.branchId,
      currency = excluded.currency,
      payFrequency = excluded.payFrequency,
      baseSalary = excluded.baseSalary,
      housingAllowance = excluded.housingAllowance,
      transportAllowance = excluded.transportAllowance,
      mealAllowance = excluded.mealAllowance,
      otherAllowance = excluded.otherAllowance,
      employerPension = excluded.employerPension,
      employerTax = excluded.employerTax,
      otherEmployerCost = excluded.otherEmployerCost,
      commissionRate = excluded.commissionRate,
      effectiveFrom = excluded.effectiveFrom,
      effectiveTo = excluded.effectiveTo,
      updatedAt = excluded.updatedAt,
      version = excluded.version;
  `,

  UPDATE_COMPENSATION: `
    UPDATE employee_compensation
    SET businessId = ?, employeeId = ?, branchId = ?,
        currency = ?, payFrequency = ?, baseSalary = ?,
        housingAllowance = ?, transportAllowance = ?,
        mealAllowance = ?, otherAllowance = ?,
        employerPension = ?, employerTax = ?,
        otherEmployerCost = ?, commissionRate = ?,
        effectiveFrom = ?, effectiveTo = ?,
        updatedAt = ?, version = ?
    WHERE id = ?;
  `,

  FIND_COMPENSATION_BY_EMPLOYEE: `
    SELECT * FROM employee_compensation
    WHERE employeeId = ?;
  `,

  // =========================================================
  // COMPENSATION HISTORY
  // =========================================================

  // Event ID should be the history row ID. A replay of the same event
  // then becomes a no-op instead of duplicating the history record.
  INSERT_COMPENSATION_HISTORY: `
    INSERT INTO employee_compensation_history (
      id, businessId, employeeId, branchId, currency,
      payFrequency, baseSalary, housingAllowance,
      transportAllowance, mealAllowance, otherAllowance,
      employerPension, employerTax, otherEmployerCost,
      commissionRate, effectiveFrom, effectiveTo,
      createdAt, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING;
  `,

  // Close only a prior open period. Keep the history table's
  // columns aligned with the migration: no updatedAt is assumed here.
  CLOSE_OPEN_COMPENSATION_HISTORY: `
    UPDATE employee_compensation_history
    SET effectiveTo = ?
    WHERE employeeId = ?
      AND effectiveTo IS NULL
      AND effectiveFrom < ?;
  `,

  FIND_COMPENSATION_HISTORY: `
    SELECT * FROM employee_compensation_history
    WHERE employeeId = ?
    ORDER BY effectiveFrom DESC, createdAt DESC;
  `,

  // =========================================================
  // PROJECTION RESET
  // =========================================================

  RESET_INVITATIONS: `DELETE FROM employee_invitations;`,
  RESET_COMPENSATION: `DELETE FROM employee_compensation;`,
  RESET_COMPENSATION_HISTORY: `DELETE FROM employee_compensation_history;`,
  RESET_EMPLOYEES: `DELETE FROM employees;`,
} as const;
