
import { apiFetch } from "../../../../../lib/api";
import { BusinessManager } from "../../../../Composer/BusinessManager";
import { changeNotifier } from "../../../../offline/sqlite/businessDatabase/projections/changeNoifier";

import type {
  Business,
  Expense,
  Inventory,
  LedgerEntry,
  Product,
  Sales,
  Branch,
} from "@business/shared-types";

import { CurrentBusinessRepository } from "../../../../offline/sqlite/clientDatabase/repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";

import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";
import { TransactionManager } from "../../../../storage/transaction/TransactionManager";

export interface BootstrapBusiness {
  businessId: string;
  branchId: string | null;
  accessToken: string;
}

export interface BootstrapSnapshot {
  business: Business;
  branches: Branch[];
  products: Product[];
  inventories: Inventory[];
  sales: Sales[];
  expenses: Expense[];
  ledgerEntries: LedgerEntry[];

  /**
   * Global event position represented by this snapshot.
   * Subsequent synchronization must start from this checkpoint.
   */
  snapshotPosition: number;
}

export class BusinessApi {
  private readonly manager: BusinessManager;
  private readonly currentBusiness: CurrentBusinessRepository;
  private readonly clientTransactionManager: TransactionManager;

  constructor(
    manager: BusinessManager,
    currentBusiness: CurrentBusinessRepository,
    clientTransactionManager: TransactionManager,
  ) {
    this.manager = manager;
    this.currentBusiness = currentBusiness;
    this.clientTransactionManager = clientTransactionManager;
  }

  async CurrentBusiness(
    businessId: string,
  ): Promise<Business | null> {
    const app = await this.manager.current();

    if (!app) {
      throw new Error("No active business application is available.");
    }

    const business =
      await app.storage.repositories.business.findById(businessId);

    if (!business) {
      throw new Error(
        `Business ${businessId} was not found in the local database.`,
      );
    }

    return business;
  }

  async BootstrapBusiness(
    request: BootstrapBusiness,
  ): Promise<void> {
    const startedAt = Date.now();
    const logPrefix = `[Bootstrap:${request.businessId}]`;

    console.log(`${logPrefix} START`, {
      at: new Date(startedAt).toISOString(),
      branchId: request.branchId,
    });

    try {
      // -------------------------------------------------------
      // 1. Request the bootstrap snapshot from the backend.
      // -------------------------------------------------------

      const data = {
        businessId: request.businessId,
        branchId: request.branchId,
      };

      console.log(`${logPrefix} REQUESTING SNAPSHOT`, {
        at: Date.now(),
      });

      const res = await apiFetch(
        `${import.meta.env.VITE_API_URL}/sync/bootstrap`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        throw new Error(
          `Business bootstrap failed: ${res.status}`,
        );
      }

      const result: BootstrapSnapshot = await res.json();

      const {
        business,
        branches,
        products,
        inventories,
        sales,
        expenses,
        ledgerEntries,
        snapshotPosition,
      } = result;

      if (!business) {
        throw new Error(
          "Business bootstrap response did not contain a business.",
        );
      }

      if (business.id !== request.businessId) {
        throw new Error(
          `Bootstrap returned business ${business.id}, expected ${request.businessId}.`,
        );
      }

      if (
        !Number.isSafeInteger(snapshotPosition) ||
        snapshotPosition < 0
      ) {
        throw new Error(
          `Invalid bootstrap snapshot position: ${snapshotPosition}`,
        );
      }

      const expectedCursor = String(snapshotPosition);

      console.log(`${logPrefix} SNAPSHOT RECEIVED`, {
        snapshotPosition,
        snapshotPositionType: typeof snapshotPosition,
        expectedCursor,
        branchCount: branches.length,
        productCount: products.length,
        inventoryCount: inventories.length,
        salesCount: sales.length,
        expenseCount: expenses.length,
        ledgerEntryCount: ledgerEntries.length,
        at: Date.now(),
      });

      // -------------------------------------------------------
      // 2. Open or initialize the local business application.
      // -------------------------------------------------------

      const app = await this.manager.bootstrap(request.businessId);

      console.log(`${logPrefix} LOCAL APPLICATION READY`, {
        at: Date.now(),
      });

      // -------------------------------------------------------
      // 3. Persist the snapshot.
      // -------------------------------------------------------

      const operations: SQLiteStatementOperation[] = [
        app.storage.repositories.business.upsertOperation(business),

        ...branches.map((branch: Branch) =>
          app.storage.repositories.branches.insertOperation(branch),
        ),

        ...products.map((product: Product) =>
          app.storage.repositories.products.upsertOperation(product),
        ),

        ...inventories.map((inventory: Inventory) =>
          app.storage.repositories.inventory.upsertOperation(inventory),
        ),

        ...sales.map((sale: Sales) =>
          app.storage.repositories.sales.upsertOperation(sale),
        ),

        ...expenses.map((expense: Expense) =>
          app.storage.repositories.expenses.upsertOperation(expense),
        ),

        ...app.storage.repositories.ledger.appendOperations(ledgerEntries),
      ];

      console.log(`${logPrefix} PERSISTING SNAPSHOT`, {
        operationCount: operations.length,
        at: Date.now(),
      });

      await app.runtime.transactionManager.run(operations);

      console.log(`${logPrefix} SNAPSHOT PERSISTED`, {
        at: Date.now(),
      });

      // -------------------------------------------------------
      // 4. Advance and verify the cursor BEFORE activating the
      //    business. Activating the business may trigger sync.
      // -------------------------------------------------------

      console.log(`${logPrefix} ADVANCING CURSOR`, {
        expectedCursor,
        at: Date.now(),
      });

      await app.storage.repositories.cursor.advanceCursor(
        expectedCursor,
      );

      const persistedCursor =
        await app.storage.repositories.cursor.getCursor();

      console.log(`${logPrefix} CURSOR VERIFICATION`, {
        expectedCursor,
        persistedCursor,
        expectedType: typeof expectedCursor,
        persistedType: typeof persistedCursor,
        matches: persistedCursor === expectedCursor,
        at: Date.now(),
      });

      if (persistedCursor !== expectedCursor) {
        throw new Error(
          `Bootstrap cursor mismatch: expected ${expectedCursor}, received ${persistedCursor}`,
        );
      }

      console.log(`${logPrefix} CURSOR READY`, {
        cursor: persistedCursor,
        at: Date.now(),
      });

      // -------------------------------------------------------
      // 5. Persist the current-business record before activating
      //    the business in application context.
      // -------------------------------------------------------

      console.log(`${logPrefix} PERSISTING CURRENT BUSINESS`, {
        at: Date.now(),
      });

      await this.clientTransactionManager.run([
        this.currentBusiness.upsertOperation({
          id: 0,
          businessId: business.id,
          businessName: business.name ?? null,
          businessCode: null,
          stage: business.status ?? "ONBOARDING",
          status: business.status ?? "CREATED",
          databaseVersion: 1,
          schemaVersion: 1,
          lastSequenceNumber: 0,
          initializedAt: business.createdAt,
          activatedAt: business.activatedAt ?? null,
          lastOpenedAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ]);

      console.log(`${logPrefix} CURRENT BUSINESS PERSISTED`, {
        at: Date.now(),
      });

      // -------------------------------------------------------
      // 6. Activate the business only after its snapshot and
      //    cursor have been persisted and verified.
      // -------------------------------------------------------

      console.log(`${logPrefix} ACTIVATING BUSINESS`, {
        at: Date.now(),
      });

      await app.context.setActiveBusiness(request.businessId);

      console.log(`${logPrefix} BUSINESS ACTIVATED`, {
        at: Date.now(),
      });

      if (request.branchId) {
        await app.context.setActiveBranch(request.branchId);

        console.log(`${logPrefix} BRANCH ACTIVATED`, {
          branchId: request.branchId,
          at: Date.now(),
        });
      }

      // -------------------------------------------------------
      // 7. Notify projections and application subscribers.
      // -------------------------------------------------------

      changeNotifier.notify([
        "application_state",
        "current_business",
        "businesses",
        "branches",
        "products",
        "inventories",
        "sales",
        "expenses",
        "ledger",
      ]);

      console.log(`${logPrefix} COMPLETE`, {
        cursor: persistedCursor,
        durationMs: Date.now() - startedAt,
        at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`${logPrefix} FAILED`, {
        error:
          error instanceof Error
            ? error.message
            : String(error),
        durationMs: Date.now() - startedAt,
        at: new Date().toISOString(),
      });

      throw error;
    }
  }
}
