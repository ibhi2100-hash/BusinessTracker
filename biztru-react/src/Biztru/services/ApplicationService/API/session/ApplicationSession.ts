import type { ClientRepositoryRegistry }
    from "../../../../offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry";

import type { ApplicationSessionState }
    from "../../../../context/AplicationSessionContext";

import type { BusinessManager }
    from "../../../../Composer/BusinessManager";

export class SessionApi {

    private readonly repositories: ClientRepositoryRegistry;
    private readonly manager: BusinessManager;

    constructor(
        repositories: ClientRepositoryRegistry,
        manager: BusinessManager
    ) {
        this.repositories = repositories;
        this.manager = manager;
    }

    async restore(): Promise<ApplicationSessionState> {

        /*
         * 1. Restore durable application session.
         */
        const clientSession =
            await this.repositories.currentSession.find();

        if (!clientSession) {
            return {
                status: "unauthenticated",
                user: null,
                business: null,
                branch: null,
            };
        }

        /*
         * 2. Restore the user referenced by the session.
         */
        const user =
            await this.repositories.users.findById(
                clientSession.userId
            );

        console.log("[SessionApi] RESTORE", {
            sessionUserId: clientSession.userId,
            userId: user?.id,
            businessId: user?.businessId,
            branchId: user?.branchId,
        });

        if (!user) {

            /*
             * The durable session points to a user
             * that no longer exists.
             *
             * Clear the invalid session.
             */
            await this.repositories.currentSession.clear();

            return {
                status: "unauthenticated",
                user: null,
                business: null,
                branch: null,
            };
        }

        /*
         * 3. The user exists.
         *
         * A user does not necessarily have a business yet.
         * This is a valid onboarding state.
         */
        if (!user.businessId) {
            return {
                status: "authenticated",
                user,
                business: null,
                branch: null,
            };
        }

        /*
         * 4. Try to obtain the currently open business.
         *
         * BusinessManager.current() MUST return undefined
         * when no business is currently open.
         *
         * It must NOT throw for that normal state.
         */
        const app = await this.manager.current();

        if (!app) {
            return {
                status: "authenticated",
                user,
                business: null,
                branch: null,
            };
        }

        /*
         * 5. Restore the user's business.
         */
        const business =
            await app.storage.repositories.business.findById(
                user.businessId
            );

        if (!business) {
            throw new Error(
                "Business referenced by user does not exist"
            );
        }

        /*
         * 6. Restore the user's branch.
         */
        if (!user.branchId) {
            return {
                status: "authenticated",
                user,
                business,
                branch: null,
            };
        }

        const branch =
            await app.storage.repositories.branches.findById(
                user.branchId
            );

        if (!branch) {
            throw new Error(
                "Branch referenced by user does not exist"
            );
        }

        console.log("[SessionApi] FINAL RESTORED SESSION", {
            userId: user.id,
            user: user,
            businessId: user.businessId,
            business: business,
            branchId: user.branchId,
            branch: branch?.id ?? null,
        });
        /*
         * 7. Fully reconstructed application session.
         */
        return {
            status: "authenticated",
            user,
            business,
            branch,
        };
    }
}