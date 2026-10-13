import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export const migration021: Migration = {
    version: 21,
    name: "Employee Management",

    up(): readonly SQLiteMigrationOperation[] {
        return [

            // =========================================================
            // EMPLOYEES
            // =========================================================

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS employees (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        branchId TEXT,

                        userId TEXT,

                        reportsToEmployeeId TEXT,

                        employeeNumber TEXT,

                        fullName TEXT NOT NULL,

                        phone TEXT,

                        email TEXT,

                        role TEXT NOT NULL,

                        employmentStatus TEXT NOT NULL,

                        joinedAt INTEGER,

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER NOT NULL,

                        version INTEGER NOT NULL DEFAULT 1
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employees_business
                    ON employees(businessId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employees_business_branch
                    ON employees(businessId, branchId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employees_branch
                    ON employees(branchId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employees_user
                    ON employees(userId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employees_reports_to
                    ON employees(reportsToEmployeeId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employees_status
                    ON employees(businessId, employmentStatus);
                `,
            },


            // =========================================================
            // EMPLOYEE INVITATIONS
            // =========================================================

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS employee_invitations (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        employeeId TEXT NOT NULL,

                        branchId TEXT,

                        email TEXT,

                        phone TEXT,

                        role TEXT NOT NULL,

                        status TEXT NOT NULL,

                        expiresAt INTEGER,

                        createdAt INTEGER NOT NULL,

                        acceptedAt INTEGER,

                        revokedAt INTEGER,

                        updatedAt INTEGER NOT NULL,

                        version INTEGER NOT NULL DEFAULT 1
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_invitations_business
                    ON employee_invitations(businessId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_invitations_employee
                    ON employee_invitations(employeeId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_invitations_status
                    ON employee_invitations(
                        businessId,
                        status
                    );
                `,
            },


            // =========================================================
            // CURRENT EMPLOYEE COMPENSATION
            // =========================================================

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS employee_compensation (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        employeeId TEXT NOT NULL,

                        branchId TEXT,

                        currency TEXT NOT NULL DEFAULT 'NGN',

                        payFrequency TEXT NOT NULL DEFAULT 'MONTHLY',

                        baseSalary REAL NOT NULL DEFAULT 0,

                        housingAllowance REAL NOT NULL DEFAULT 0,

                        transportAllowance REAL NOT NULL DEFAULT 0,

                        mealAllowance REAL NOT NULL DEFAULT 0,

                        otherAllowance REAL NOT NULL DEFAULT 0,

                        employerPension REAL NOT NULL DEFAULT 0,

                        employerTax REAL NOT NULL DEFAULT 0,

                        otherEmployerCost REAL NOT NULL DEFAULT 0,

                        commissionRate REAL NOT NULL DEFAULT 0,

                        effectiveFrom INTEGER NOT NULL,

                        effectiveTo INTEGER,

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER NOT NULL,

                        version INTEGER NOT NULL DEFAULT 1,

                        UNIQUE(employeeId)
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_compensation_business
                    ON employee_compensation(businessId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_compensation_branch
                    ON employee_compensation(
                        businessId,
                        branchId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_compensation_employee
                    ON employee_compensation(employeeId);
                `,
            },


            // =========================================================
            // EMPLOYEE COMPENSATION HISTORY
            // =========================================================

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS employee_compensation_history (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        employeeId TEXT NOT NULL,

                        branchId TEXT,

                        currency TEXT NOT NULL DEFAULT 'NGN',

                        payFrequency TEXT NOT NULL DEFAULT 'MONTHLY',

                        baseSalary REAL NOT NULL DEFAULT 0,

                        housingAllowance REAL NOT NULL DEFAULT 0,

                        transportAllowance REAL NOT NULL DEFAULT 0,

                        mealAllowance REAL NOT NULL DEFAULT 0,

                        otherAllowance REAL NOT NULL DEFAULT 0,

                        employerPension REAL NOT NULL DEFAULT 0,

                        employerTax REAL NOT NULL DEFAULT 0,

                        otherEmployerCost REAL NOT NULL DEFAULT 0,

                        commissionRate REAL NOT NULL DEFAULT 0,

                        effectiveFrom INTEGER NOT NULL,

                        effectiveTo INTEGER,

                        createdAt INTEGER NOT NULL,

                        version INTEGER NOT NULL DEFAULT 1
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_compensation_history_business
                    ON employee_compensation_history(
                        businessId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_compensation_history_employee
                    ON employee_compensation_history(
                        employeeId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_compensation_history_effective
                    ON employee_compensation_history(
                        employeeId,
                        effectiveFrom,
                        effectiveTo
                    );
                `,
            },


            // =========================================================
            // EMPLOYEE REQUESTS
            // =========================================================

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS employee_requests (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        branchId TEXT,

                        requesterEmployeeId TEXT NOT NULL,

                        assignedToEmployeeId TEXT,

                        type TEXT NOT NULL,

                        title TEXT NOT NULL,

                        description TEXT,

                        status TEXT NOT NULL,

                        priority TEXT NOT NULL DEFAULT 'NORMAL',

                        amount REAL,

                        currency TEXT,

                        submittedAt INTEGER NOT NULL,

                        resolvedAt INTEGER,

                        resolutionNote TEXT,

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER NOT NULL,

                        version INTEGER NOT NULL DEFAULT 1
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_requests_business
                    ON employee_requests(businessId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_requests_business_branch
                    ON employee_requests(
                        businessId,
                        branchId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_requests_requester
                    ON employee_requests(
                        requesterEmployeeId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_requests_assignee
                    ON employee_requests(
                        assignedToEmployeeId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_requests_status
                    ON employee_requests(
                        businessId,
                        status
                    );
                `,
            },


            // =========================================================
            // EMPLOYEE NOTIFICATIONS
            // =========================================================

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS employee_notifications (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        employeeId TEXT NOT NULL,

                        type TEXT NOT NULL,

                        title TEXT NOT NULL,

                        message TEXT NOT NULL,

                        referenceType TEXT,

                        referenceId TEXT,

                        read INTEGER NOT NULL DEFAULT 0,

                        createdAt INTEGER NOT NULL,

                        readAt INTEGER
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_notifications_employee
                    ON employee_notifications(
                        employeeId,
                        read,
                        createdAt
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_employee_notifications_business
                    ON employee_notifications(
                        businessId
                    );
                `,
            },
        ];
    },
};