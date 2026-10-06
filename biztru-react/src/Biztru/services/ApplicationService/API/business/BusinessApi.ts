import { apiFetch } from "../../../../../lib/api"; 
import { BusinessManager } from "../../../../Composer/BusinessManager"; 
import { changeNotifier } from "../../../../offline/sqlite/businessDatabase/projections/changeNoifier"; 
import type{ Business, Expense, Inventory, Product, Sales } from "@business/shared-types";
import { CurrentBusinessRepository } from "../../../../offline/sqlite/clientDatabase/repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";  
import type{ SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 
import { TransactionManager } from "../../../../storage/transaction/TransactionManager"; 

import type{ Branch } from "@business/shared-types";

export interface BootstrapBusiness {
    businessId: string;
    branchId: string | null;
    accessToken: string;
}

export class BusinessApi {
    private readonly manager: BusinessManager;
    private readonly currentBusiness: CurrentBusinessRepository
    private readonly clientTransactionManager: TransactionManager
    constructor(
        manager: BusinessManager,
        currentBusiness: CurrentBusinessRepository,
        clientTransactionManager: TransactionManager
    ) {
        this.manager = manager;
        this.currentBusiness = currentBusiness;
        this.clientTransactionManager = clientTransactionManager;
    }

    async CurrentBusiness(
        businessId: string
    ): Promise<Business | null> {

        const app =
            await this.manager.current();

        const business =  app?.storage.repositories.business
            .findById(businessId);
        if(!business){
            throw new Error("This is the Charger")
        }

        return business
    }

    async BootstrapBusiness(
        request: BootstrapBusiness
    ): Promise<void> {

        const data = {
            businessId: request.businessId,
            branchId: request.branchId,
        };

        const res = await apiFetch(
            `${import.meta.env.VITE_API_URL}/sync/bootstrap`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) {
            throw new Error(
                `Business bootstrap failed: ${res.status}`
            );
        }

        const result = await res.json();

        const {
            business,
            branches,
            products,
            inventories,
            sales,
            expenses,
            ledgerEntries,
        } = result;

        if (!business) {
            throw new Error(
                "Business bootstrap response did not contain a business."
            );
        }

        const app =
            await this.manager.bootstrap(
                request.businessId
            );

        const operations: SQLiteStatementOperation[] = [
            app.storage.repositories.business.upsertOperation(business),

            ...branches.map(
                (branch: Branch) =>
                    app.storage.repositories.branches.insertOperation(branch)
            ),

            ...products.map(
                (product: Product) =>
                    app.storage.repositories.products.upsertOperation(product)
            ),

            ...inventories.map(
                (inventory: Inventory) =>
                    app.storage.repositories.inventory.upsertOperation(inventory)
            ),

            ...sales.map(
                (sale: Sales)=>
                    app.storage.repositories.sales.upsertOperation(sale)
            ),

            ...expenses.map(
                (expense: Expense)=>
                    app.storage.repositories.expenses.upsertOperation(expense)
            ),

            ...app.storage.repositories.ledger.appendOperations(ledgerEntries),


        ];

        await app.runtime.transactionManager.run(operations);  
        
        // 3. Update client/application state
        await app.context.setActiveBusiness(
            request.businessId
        );

        if (request.branchId) {
            await app.context.setActiveBranch(
                request.branchId
            );
        }

        // 4. Update current-business record in client DB
        this.clientTransactionManager.run([
            this.currentBusiness.upsertOperation({
                id: 0,

                businessId: business.id,

                businessName:
                    business.name ?? null,

                businessCode:
                    business.code ?? null,

                stage:
                    business.status ?? "ONBOARDING",

                status:
                    business.status ?? "CREATED",

                databaseVersion:
                    business.databaseVersion ?? 1,

                schemaVersion:
                    business.schemaVersion ?? 1,

                lastSequenceNumber:
                    business.lastSequenceNumber ?? 0,

                initializedAt:
                    business.initializedAt,

                activatedAt:
                    business.activatedAt ?? null,

                lastOpenedAt:
                    Date.now(),

                updatedAt:
                    Date.now(),
            }),
        ]);
        console.log("Bootstrapping of current business just finished: ", business)
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
    }
}