import { BootContext, BootTask } from "../BootStage";

export class OpenBusinessTask
implements BootTask {

    readonly id: string = "business.open";

    readonly title: string = "Opening Business";

    readonly weight: number = 30;

    async execute(context: BootContext): Promise<void> {
        
        const manager = 
            context.runtime.businessManager;

        const business = 
            manager.current();

        if(!business){
            return;
        }

        await manager.start()
    }
}