import { BootContext, BootTask } from "../BootStage";

export class OpenBusinessTask
implements BootTask {

    readonly id: string = "business.open";

    readonly title: string = "Opening Business";

    readonly weight: number = 30;

    async execute(context: BootContext): Promise<void> {
        
        const manager = 
            context.runtime.businessManager;
        if(!manager) {
            throw new Error(
                "BusinessManager has not been created"
            )
        }

        await manager.start()
    }
}