import { Application } from "../../Application";
import { BootContext, BootTask } from "../BootStage";

export class CreateApplicationTask 
implements BootTask {

    readonly id: string = "application.create";

    readonly title: string = "Building Application";

    readonly weight: number = 10;

    async execute(context: BootContext): Promise<void> {
        context.output.application = 
            new Application(
                context.infrastructure.client,
                context.runtime.businessManager
            )
    }

}