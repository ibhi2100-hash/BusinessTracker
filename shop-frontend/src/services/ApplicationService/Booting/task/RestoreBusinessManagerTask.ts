import { BootContext, BootTask } from "../BootStage";

export class RestoreBusinessManagerTask
implements BootTask {
    readonly id: string = "business.restore";

    readonly title: string = " Restoring Workspace";

    readonly weight: number = 20;

    async execute(context: BootContext): Promise<void> {
        const manager = 
            context.runtime.businessManager;
            await manager.initialize();
            

    }
}