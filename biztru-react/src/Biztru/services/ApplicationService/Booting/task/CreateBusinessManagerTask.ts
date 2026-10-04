import { BusinessBootstrapper } from "../../../../../offline/bootstrap/BusinessBootstrap";
import type{ BootContext, BootTask } from "../BootStage";
import { BusinessManager } from "../../../../Composer/BusinessManager"; 

export class CreateBusinessManagerTask
implements BootTask {
    readonly id: string = "business.manager";

    readonly title: string = "Creating Business Manager";

    readonly weight: number = 10;
    private readonly bootstrapper: BusinessBootstrapper;
    constructor(
        bootstrapper: BusinessBootstrapper
    ){
        this.bootstrapper = bootstrapper
    }

    async execute(context: BootContext): Promise<void> {
        context.runtime.businessManager =
            new BusinessManager(
                context.infrastructure.client!,
                this.bootstrapper
            )
    }
}