
import type {
  SQLiteStatementOperation,
} from "../../../../../storage/statement/worker/WorkerProtocol";

import { BillingPlanVersionStatement } from "../../statements/billing/planVersions/billingPlanVersionStatements";

import { billingPlanVersionKeys } from "../../statements/billing/planVersions/billingPlanVersionStatementKey"; 

export type LocalBillingCycle =
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY"
  | "LIFETIME";

export interface LocalBillingPlanVersion {
  id: string;
  planId: string;
  planVersion: number;

  priceMinor: number;
  currency: string;
  billingCycle: LocalBillingCycle;

  intervalCount: number;
  trialDays: number;

  maxStaff: number | null;
  maxBranch: number | null;
  maxProduct: number | null;

  featuresJson: string;

  publishedAt: number | null;
  createdAt: number;
}

export interface BillingPlanVersionCountRow {
  count: number;
}

export class SQLiteBillingPlanVersionRepository {
  private readonly statements: BillingPlanVersionStatement;

  constructor(statements: BillingPlanVersionStatement) {
    this.statements = statements;
  }

  // ============================================================
  // TRANSACTION OPERATIONS
  // ============================================================

  insertOperation(
    version: LocalBillingPlanVersion,
  ): SQLiteStatementOperation {
    return {
      statementKey: billingPlanVersionKeys.insert,
      params: BillingPlanVersionMapper.toInsert(version),
    };
  }

  markPublishedOperation(
    planId: string,
    planVersion: number,
    publishedAt: number,
  ): SQLiteStatementOperation {
    return {
      statementKey: billingPlanVersionKeys.markPublished,
      params: [
        publishedAt,
        planId,
        planVersion,
      ],
    };
  }

  // ============================================================
  // IMMEDIATE WRITES
  // ============================================================

  async insert(
    version: LocalBillingPlanVersion,
  ): Promise<void> {
    this.validate(version);

    await this.statements.insert.execute(
      BillingPlanVersionMapper.toInsert(version),
    );
  }

  async markPublished(
    planId: string,
    planVersion: number,
    publishedAt: number,
  ): Promise<void> {
    await this.statements.markPublished.execute([
      publishedAt,
      planId,
      planVersion,
    ]);
  }

  // ============================================================
  // SINGLE RECORD
  // ============================================================

  async findById(
    id: string,
  ): Promise<LocalBillingPlanVersion | null> {
    const rows =
      await this.statements.findById.query<LocalBillingPlanVersion>([
        id,
      ]);

    return rows[0] ?? null;
  }

  async findByPlanAndVersion(
    planId: string,
    planVersion: number,
  ): Promise<LocalBillingPlanVersion | null> {
    const rows =
      await this.statements.findByPlanAndVersion.query<LocalBillingPlanVersion>([
        planId,
        planVersion,
      ]);

    return rows[0] ?? null;
  }

  async findLatest(
    planId: string,
  ): Promise<LocalBillingPlanVersion | null> {
    const rows =
      await this.statements.findLatest.query<LocalBillingPlanVersion>([
        planId,
      ]);

    return rows[0] ?? null;
  }

  async findLatestPublished(
    planId: string,
  ): Promise<LocalBillingPlanVersion | null> {
    const rows =
      await this.statements.findLatestPublished.query<LocalBillingPlanVersion>([
        planId,
      ]);

    return rows[0] ?? null;
  }

  // ============================================================
  // LIST
  // ============================================================

  async findByPlan(
    planId: string,
  ): Promise<LocalBillingPlanVersion[]> {
    return this.statements.findByPlan.query<LocalBillingPlanVersion>([
      planId,
    ]);
  }

  async findPublishedByPlan(
    planId: string,
  ): Promise<LocalBillingPlanVersion[]> {
    return this.statements.findPublishedByPlan.query<LocalBillingPlanVersion>([
      planId,
    ]);
  }

  async findAll(): Promise<LocalBillingPlanVersion[]> {
    return this.statements.findAll.query<LocalBillingPlanVersion>([]);
  }

  async getAll(): Promise<LocalBillingPlanVersion[]> {
    return this.statements.getAll.query<LocalBillingPlanVersion>([]);
  }

  // ============================================================
  // COUNT
  // ============================================================

  async countByPlan(planId: string): Promise<number> {
    const rows =
      await this.statements.countByPlan.query<BillingPlanVersionCountRow>([
        planId,
      ]);

    return Number(rows[0]?.count ?? 0);
  }

  // ============================================================
  // SYNCHRONIZATION
  // ============================================================

  /**
   * Inserts missing versions without modifying existing terms.
   *
   * The caller should execute the returned operations in the
   * same transaction as the related billing-plan upserts.
   */
  syncOperations(
    versions: LocalBillingPlanVersion[],
  ): SQLiteStatementOperation[] {
    for (const version of versions) {
      this.validate(version);
    }

    return versions.map((version) => this.insertOperation(version));
  }

  /**
   * Detects a conflicting server snapshot.
   *
   * A planId + planVersion pair must always represent the same
   * immutable commercial terms. If the server sends different
   * terms for an already-known version, do not silently replace
   * the local record.
   */
  async hasMatchingVersion(
    incoming: LocalBillingPlanVersion,
  ): Promise<boolean> {
    const existing = await this.findByPlanAndVersion(
      incoming.planId,
      incoming.planVersion,
    );

    if (!existing) return true;

    return (
      existing.id === incoming.id &&
      existing.priceMinor === incoming.priceMinor &&
      existing.currency === incoming.currency &&
      existing.billingCycle === incoming.billingCycle &&
      existing.intervalCount === incoming.intervalCount &&
      existing.trialDays === incoming.trialDays &&
      existing.maxStaff === incoming.maxStaff &&
      existing.maxBranch === incoming.maxBranch &&
      existing.maxProduct === incoming.maxProduct &&
      existing.featuresJson === incoming.featuresJson
    );
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  private validate(
    version: LocalBillingPlanVersion,
  ): void {
    if (!version.id || !version.planId) {
      throw new Error("Billing plan version requires id and planId.");
    }

    if (
      !Number.isSafeInteger(version.planVersion) ||
      version.planVersion < 1
    ) {
      throw new Error("Invalid billing plan version number.");
    }

    if (
      !Number.isSafeInteger(version.priceMinor) ||
      version.priceMinor < 0
    ) {
      throw new Error("Invalid billing plan version price.");
    }

    if (
      !Number.isSafeInteger(version.intervalCount) ||
      version.intervalCount < 1
    ) {
      throw new Error("Invalid billing interval count.");
    }

    if (
      !Number.isSafeInteger(version.trialDays) ||
      version.trialDays < 0
    ) {
      throw new Error("Invalid billing trial days.");
    }

    try {
      const features = JSON.parse(version.featuresJson);

      if (
        features === null ||
        typeof features !== "object" ||
        Array.isArray(features)
      ) {
        throw new Error();
      }
    } catch {
      throw new Error("Invalid billing plan features JSON.");
    }
  }
}

// ================================================================
// MAPPER
// ================================================================

export class BillingPlanVersionMapper {
  static toInsert(
    version: LocalBillingPlanVersion,
  ): unknown[] {
    return [
      version.id,
      version.planId,
      version.planVersion,
      version.priceMinor,
      version.currency,
      version.billingCycle,
      version.intervalCount,
      version.trialDays,
      version.maxStaff,
      version.maxBranch,
      version.maxProduct,
      version.featuresJson,
      version.publishedAt,
      version.createdAt,
    ];
  }
}
