import { ClientBootstrapper } from "../../../../../offline/bootstrap/ClientBootstrapper"; 
import type{ BootContext, BootTask } from "../BootStage";

export class InitializeClientTask
implements BootTask {
    readonly id: string = "client.initialize";

    readonly title: string = "Initializing Client";

    readonly weight: number = 25;
    private readonly bootstrapper: ClientBootstrapper
    constructor(
        bootstrapper: ClientBootstrapper
    ){
        this.bootstrapper = bootstrapper
    }

    async execute(
        context: BootContext
    ): Promise<void> {
        
        context.infrastructure.client = 
            await this.bootstrapper.bootstrap();
    }
}