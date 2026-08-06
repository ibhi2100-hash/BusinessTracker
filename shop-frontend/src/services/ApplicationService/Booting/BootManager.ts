import { ClientBootstrapper } from "@/offline/bootstrap/ClientBootstrapper";
import { BusinessBootstrapper } from "@/offline/bootstrap/BusinessBootstrap";
import { Application } from "@/src/services/ApplicationService/Application";

import { BootPipeline } from "./BootPipeline";

import {
    BootContext,
    BootListener,
    BootResult,
    BootReport,
    BootTask
 } from "./BootStage";

import { InitializeClientTask } from "./task/InitializeClientTask";
import { CreateBusinessManagerTask } from "./task/CreateBusinessManagerTask";
import { RestoreBusinessManagerTask } from "./task/RestoreBusinessManagerTask";
import { OpenBusinessTask } from "./task/OpenBusinessTask";
import { DetermineStartupTask } from "./task/DetermineStartupTask";
import { CreateApplicationTask } from "./task/CreateApplicationTask";

export class BootManager {

    constructor(

        private readonly clientBootstrapper:
            ClientBootstrapper,

        private readonly businessBootstrapper:
            BusinessBootstrapper

    ) {}

    async boot(
        listener?: BootListener
    ): Promise<BootResult> {

        const startedAt = Date.now();

        const context =
            this.createContext();

        const pipeline =
            this.createPipeline();

        const taskReports =
            await pipeline.execute(
                context,
                listener
            );

        const finishedAt = Date.now();

        const report: BootReport = {

            startedAt,

            finishedAt,

            duration:
                finishedAt - startedAt,

            tasks:
                taskReports

        };

        return {

            application:
                context.output.application!,

            destination:
                context.output.destination!,

            report

        };

    }

    private createContext(): BootContext {

        return {

            infrastructure: {},

            runtime: {},

            output: {}

        };

    }

    private createPipeline(): BootPipeline {

        return new BootPipeline(

            this.createTasks()

        );

    }

    private createTasks(): readonly BootTask[] {

        return [

            new InitializeClientTask(

                this.clientBootstrapper

            ),

            new CreateBusinessManagerTask(

                this.businessBootstrapper

            ),

            new RestoreBusinessManagerTask(),

            new OpenBusinessTask(),

            new DetermineStartupTask(),

            new CreateApplicationTask()

        ];

    }

}