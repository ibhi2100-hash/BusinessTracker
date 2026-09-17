import { apiFetch } from "@/lib/api";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { changeNotifier } from "@/src/offline/sqlite/businessDatabase/projections/changeNoifier";
import { Business } from "@business/shared-types";
import { CurrentBusinessRepository } from "@/src/offline/sqlite/clientDatabase/repositories/CurrentBusiness/SQLiteCurrentBusinessRepository"; 

export interface BootstrapBusiness {
    businessId: string;
    branchId: string | null;
    accessToken: string;
}

export class BusinessApi {

    constructor(
        private readonly manager: BusinessManager,
        private readonly currentBusiness:
            CurrentBusinessRepository
    ) {}

    async CurrentBusiness(
        businessId: string
    ): Promise<Business | null> {

        const app =
            await this.manager.current();

        return app.storage.repositories.business
            .findById(businessId);
    }

    async BootstrapBusiness(
        request: BootstrapBusiness
    ): Promise<void> {

        const data = {
            businessId: request.businessId,
            branchId: request.branchId,
        };

        const res = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sync/bootstrap`,
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

        await app.runtime.transactionManager.run(
            async () => {

                await app.storage.repositories.business
                    .upsert(business);

                for (const branch of branches) {
                    await app.storage.repositories.branches
                        .upsert(branch);
                }

                await app.context.setActiveBusiness(
                    request.businessId
                );

                if (request.branchId) {
                    await app.context.setActiveBranch(
                        request.branchId
                    );
                }

                for (const product of products) {
                    await app.storage.repositories.products
                        .upsert(product);
                }

                for (const inventory of inventories) {
                    await app.storage.repositories.inventory
                        .upsert(inventory);
                }

                for (const sale of sales) {
                    await app.storage.repositories.sales
                        .upsert(sale);
                }

                for (const expense of expenses) {
                    await app.storage.repositories.expenses
                        .upsert(expense);
                }

                await app.storage.repositories.ledger
                    .append(ledgerEntries);

                /*
                 * Save the active business in the CLIENT database.
                 *
                 * This is deliberately outside app.storage because
                 * app.storage belongs to the business database.
                 */
                await this.currentBusiness.save({
                    id: 0,

                    businessId:
                        business.id,

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
                });

                const businesses =
                    await app.storage.repositories.business
                        .findAll();

                console.log(
                    "These are the businesses saved in frontend:",
                    businesses
                );
            }
        );

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