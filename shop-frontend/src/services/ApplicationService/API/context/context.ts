import { BusinessManager } from "@/src/Composer/BusinessManager";

export class ContextApi {

    constructor(
        private readonly manager: BusinessManager
    ){}

    async current(){
        const app = await this.manager.current();
        const context = await app.context.current();

        return context
    }

    async setActiveBranch(){

    }

    clearCache(){
        
    }

}