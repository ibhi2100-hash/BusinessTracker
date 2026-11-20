
import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";

import {
    PlatformAuditRepository,
    type CreatePlatformAuditLogInput,
    type PlatformAuditListParams,
} from "../repositories/platform-audit.repository.js";

type DbClient = Prisma.TransactionClient;

interface RecordPlatformAuditInput {
    actorPlatformUserId?: string | null;

    action: string;

    resourceType: string;
    resourceId?: string | null;

    targetBusinessId?: string | null;

    reason?: string | null;

    beforeData?: unknown;
    afterData?: unknown;
    metadata?: unknown;

    ipAddress?: string | null;
    userAgent?: string | null;
    correlationId?: string | null;
}

interface ListPlatformAuditInput {
    actorPlatformUserId?: string;
    targetBusinessId?: string;

    action?: string;
    resourceType?: string;
    resourceId?: string;

    correlationId?: string;

    from?: Date;
    to?: Date;

    skip?: number;
    take?: number;
}

interface PaginationInput {
    skip?: number;
    take?: number;
}

const REASON_REQUIRED_ACTIONS = new Set<string>([
    "PLATFORM_USER_SUSPENDED",
    "PLATFORM_USER_DISABLED",
    "PLATFORM_USER_SESSIONS_REVOKED",
    "PLATFORM_ROLE_DELETED",
    "PLATFORM_ROLE_REVOKED",
    "PLATFORM_PERMISSION_REVOKED",

    "TENANT_SUSPENDED",
    "TENANT_REACTIVATED",

    "BILLING_SUBSCRIPTION_CHANGED",
    "BILLING_ENTITLEMENT_OVERRIDE_GRANTED",
    "BILLING_ENTITLEMENT_OVERRIDE_REVOKED",
    "BILLING_PAYMENT_REFUNDED",

    "SUPPORT_ACCESS_APPROVED",
    "SUPPORT_ACCESS_REVOKED",

    "PLATFORM_SETTING_UPDATED",
    "PLATFORM_FEATURE_FLAG_UPDATED",
]);

const SECRET_KEYS = new Set<string>([
    "password",
    "passwordhash",
    "currentpassword",
    "newpassword",
    "refreshtoken",
    "refreshtokenhash",
    "accesstoken",
    "token",
    "tokenhash",
    "secret",
    "secretencrypted",
    "apikey",
    "authorization",
    "cookie",
    "setcookie",
    "privatekey",
    "mfa",
    "mfasecret",
    "signedtoken",
    "credentials",
]);

const MAX_AUDIT_DEPTH = 8;
const MAX_AUDIT_STRING_LENGTH = 10_000;

/**
 * Normalize property names.
 *
 * Examples:
 * refreshToken  -> refreshtoken
 * refresh_token -> refreshtoken
 * REFRESH_TOKEN -> refreshtoken
 */
function normalizeKey(key: string): string {
    return key
        .replace(/[_-]/g, "")
        .toLowerCase();
}

/**
 * Validate optional string values.
 */
function normalizeOptionalString(
    value: string | null | undefined,
    fieldName: string
): string | null {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${fieldName} cannot be empty`);
    }

    return value.trim();
}

/**
 * Recursively sanitize audit data.
 *
 * Handles:
 * - Sensitive properties
 * - Circular references
 * - Excessive nesting
 * - BigInt values
 * - Dates
 * - Unsupported JavaScript values
 * - Invalid numbers
 */
function sanitizeAuditValue(
    value: unknown,
    depth = 0,
    seen = new WeakSet<object>()
): unknown {
    if (value === null || value === undefined) {
        return null;
    }

    if (depth > MAX_AUDIT_DEPTH) {
        return "[MAX_DEPTH_REACHED]";
    }

    if (typeof value === "string") {
        return value.length > MAX_AUDIT_STRING_LENGTH
            ? `${value.slice(0, MAX_AUDIT_STRING_LENGTH)}...[TRUNCATED]`
            : value;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : String(value);
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "bigint") {
        return value.toString();
    }

    if (typeof value === "undefined") {
        return null;
    }

    if (typeof value === "function" || typeof value === "symbol") {
        return "[UNSUPPORTED_VALUE]";
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
            ? "[INVALID_DATE]"
            : value.toISOString();
    }

    if (typeof value === "object") {
        if (seen.has(value)) {
            return "[CIRCULAR_REFERENCE]";
        }

        seen.add(value);

        try {
            if (Array.isArray(value)) {
                return value.map((item) =>
                    sanitizeAuditValue(
                        item,
                        depth + 1,
                        seen
                    )
                );
            }

            const output: Record<string, unknown> = {};

            for (const [key, item] of Object.entries(value)) {
                if (SECRET_KEYS.has(normalizeKey(key))) {
                    output[key] = "[REDACTED]";
                    continue;
                }

                output[key] = sanitizeAuditValue(
                    item,
                    depth + 1,
                    seen
                );
            }

            return output;
        } finally {
            seen.delete(value);
        }
    }

    return "[UNSUPPORTED_VALUE]";
}

/**
 * Convert sanitized data to Prisma-compatible JSON.
 */
function toAuditJson(
    value: unknown
): Prisma.InputJsonValue | null {
    if (value === undefined || value === null) {
        return null;
    }

    const sanitized = sanitizeAuditValue(value);

    return JSON.parse(
        JSON.stringify(sanitized)
    ) as Prisma.InputJsonValue;
}

/**
 * Validate date filters.
 */
function validateDateRange(
    from?: Date,
    to?: Date
): void {
    if (from !== undefined) {
        if (
            !(from instanceof Date) ||
            Number.isNaN(from.getTime())
        ) {
            throw new Error("Invalid audit start date");
        }
    }

    if (to !== undefined) {
        if (
            !(to instanceof Date) ||
            Number.isNaN(to.getTime())
        ) {
            throw new Error("Invalid audit end date");
        }
    }

    if (from && to && from > to) {
        throw new Error(
            "Audit start date cannot be after end date"
        );
    }
}

/**
 * Normalize and validate pagination.
 */
function normalizePagination(
    skip?: number,
    take?: number
): {
    skip: number;
    take: number;
} {
    const normalizedSkip = skip ?? 0;
    const normalizedTake = take ?? 50;

    if (
        !Number.isSafeInteger(normalizedSkip) ||
        normalizedSkip < 0
    ) {
        throw new Error("Invalid pagination offset");
    }

    if (
        !Number.isSafeInteger(normalizedTake) ||
        normalizedTake < 1 ||
        normalizedTake > 100
    ) {
        throw new Error(
            "Audit page size must be between 1 and 100"
        );
    }

    return {
        skip: normalizedSkip,
        take: normalizedTake,
    };
}

/**
 * Validate required identifiers.
 */
function validateRequiredString(
    value: string,
    fieldName: string
): string {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${fieldName} is required`);
    }

    return value.trim();
}

export class PlatformAuditService {
    constructor(
        private readonly auditRepository: PlatformAuditRepository
    ) {}

    // ==================================================
    // WRITE OPERATIONS
    // ==================================================

    /**
     * Record a platform administrative operation.
     *
     * IMPORTANT:
     * The caller must provide the active Prisma transaction.
     *
     * The audit record is committed or rolled back together
     * with the operation being audited.
     */
    async record(
        input: RecordPlatformAuditInput,
        tx: DbClient
    ) {
        if (!tx) {
            throw new Error(
                "A Prisma transaction client is required for audit recording"
            );
        }

        const action = validateRequiredString(
            input.action,
            "Audit action"
        );

        const resourceType = validateRequiredString(
            input.resourceType,
            "Audit resource type"
        );

        const reason = normalizeOptionalString(
            input.reason,
            "Audit reason"
        );

        // Corrected original syntax error.
        if (
            REASON_REQUIRED_ACTIONS.has(action) &&
            !reason
        ) {
            throw new Error(
                `A reason is required for audit action: ${action}`
            );
        }

        const data: CreatePlatformAuditLogInput = {
            actorPlatformUserId:
                normalizeOptionalString(
                    input.actorPlatformUserId,
                    "Actor platform user ID"
                ),

            action,

            resourceType,

            resourceId:
                normalizeOptionalString(
                    input.resourceId,
                    "Resource ID"
                ),

            targetBusinessId:
                normalizeOptionalString(
                    input.targetBusinessId,
                    "Target business ID"
                ),

            reason,

            beforeData: toAuditJson(input.beforeData),
            afterData: toAuditJson(input.afterData),
            metadata: toAuditJson(input.metadata),

            ipAddress:
                normalizeOptionalString(
                    input.ipAddress,
                    "IP address"
                ),

            userAgent:
                normalizeOptionalString(
                    input.userAgent,
                    "User agent"
                ),

            correlationId:
                normalizeOptionalString(
                    input.correlationId,
                    "Correlation ID"
                ),
        };

        return this.auditRepository.create(data, tx);
    }

    // ==================================================
    // READ OPERATIONS
    // ==================================================

    /**
     * Retrieve an audit record by ID.
     */
    async getById(id: string) {
        const normalizedId = validateRequiredString(
            id,
            "Audit record ID"
        );

        const record = await this.auditRepository.findById(
            normalizedId
        );

        if (!record) {
            throw new Error("Audit record not found");
        }

        return record;
    }

    /**
     * Search platform audit records.
     */
    async list(
        input: ListPlatformAuditInput = {}
    ) {
        validateDateRange(
            input.from,
            input.to
        );

        const pagination = normalizePagination(
            input.skip,
            input.take
        );

        const params: PlatformAuditListParams = {
            ...(input.actorPlatformUserId !== undefined && {
                actorPlatformUserId: input.actorPlatformUserId,
            }),
            ...(input.targetBusinessId !== undefined && {
                targetBusinessId: input.targetBusinessId,
            }),
            ...(input.action !== undefined && { action: input.action }),
            ...(input.resourceType !== undefined && {
                resourceType: input.resourceType,
            }),
            ...(input.resourceId !== undefined && {
                resourceId: input.resourceId,
            }),
            ...(input.correlationId !== undefined && {
                correlationId: input.correlationId,
            }),
            ...(input.from !== undefined && { from: input.from }),
            ...(input.to !== undefined && { to: input.to }),

            ...pagination,
        };

        const [records, total] = await Promise.all([
            this.auditRepository.findMany(params),
            this.auditRepository.count(params),
        ]);

        return {
            records,

            pagination: {
                skip: pagination.skip,
                take: pagination.take,
                total,

                hasMore:
                    pagination.skip + records.length < total,
            },
        };
    }

    /**
     * Retrieve the audit history of a resource.
     */
    async getResourceHistory(
        resourceType: string,
        resourceId: string,
        params?: PaginationInput
    ) {
        const normalizedResourceType =
            validateRequiredString(
                resourceType,
                "Resource type"
            );

        const normalizedResourceId =
            validateRequiredString(
                resourceId,
                "Resource ID"
            );

        const pagination = normalizePagination(
            params?.skip,
            params?.take
        );

        return this.auditRepository.findByResource(
            normalizedResourceType,
            normalizedResourceId,
            pagination
        );
    }

    /**
     * Retrieve administrative activity affecting a tenant.
     */
    async getBusinessHistory(
        businessId: string,
        params?: PaginationInput
    ) {
        const normalizedBusinessId =
            validateRequiredString(
                businessId,
                "Business ID"
            );

        const pagination = normalizePagination(
            params?.skip,
            params?.take
        );

        return this.auditRepository.findByBusinessId(
            normalizedBusinessId,
            pagination
        );
    }

    /**
     * Retrieve activity performed by a platform administrator.
     */
    async getActorHistory(
        platformUserId: string,
        params?: PaginationInput
    ) {
        const normalizedPlatformUserId =
            validateRequiredString(
                platformUserId,
                "Platform user ID"
            );

        const pagination = normalizePagination(
            params?.skip,
            params?.take
        );

        return this.auditRepository.findByActor(
            normalizedPlatformUserId,
            pagination
        );
    }

    /**
     * Retrieve records belonging to one request.
     */
    async getCorrelationHistory(
        correlationId: string
    ) {
        const normalizedCorrelationId =
            validateRequiredString(
                correlationId,
                "Correlation ID"
            );

        return this.auditRepository.findByCorrelationId(
            normalizedCorrelationId
        );
    }
}
