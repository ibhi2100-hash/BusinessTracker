import { BootContext, BootTask, StartupDestination } from "../BootStage";

export class DetermineStartupTask 
implements BootTask {
    readonly id: string = " startup.route";

    readonly title: string = "Determining Startup";

    readonly weight: number = 5;

    async execute(context: BootContext): Promise<void> {
        const current = 
            await context
                .infrastructure
                .client
                .repositories
                .currentBusiness
                .find();

            if(!current?.businessId) {
                context.output.destination = 
                    StartupDestination.HOME;

                    return;
            }

            if(current.stage === "ONBOARDING"){
                context.output.destination =
                    StartupDestination.ONBOARD;

                return
            }

            context.output.destination = 
                StartupDestination.DASHBOARD
    }
}