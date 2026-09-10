import { BusinessManager } from "@/src/Composer/BusinessManager";

export class ContextApi {

    constructor(
        private readonly manager: BusinessManager
    ) {}

    async current() {
        const app = await this.manager.current();
        return await app.context.current();
    }

    async setActiveBusiness(businessId: string) {
        const app = await this.manager.current();

        await app.context.setActiveBusiness(businessId);
    }

    async setActiveBranch(branchId: string) {
        const app = await this.manager.current();

        await app.context.setActiveBranch(branchId);
    }

    clearCache() {
        // If appropriate, delegate this to the application context.
    }
}