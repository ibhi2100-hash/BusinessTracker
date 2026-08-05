import { IntegrationEvent } from "@business/shared-types";
import {
    PipelineContext,
    PipelineKernel,
    BusinessSession,
    SessionProvider
} from "../../contracts/SubKernelContracts";
import { Command } from "../../KarnelTypes/types";
import { CommandMetadata } from "../../BusinessClock/MetadataBuilderContract";

export abstract class ExecutionKernel
    implements PipelineKernel {

    constructor(
        private provider: 
            SessionProvider
    ){}
    public async execute(
        context: PipelineContext
    ): Promise<void> {

        const diagnostics =
            context.diagnostics;

        diagnostics.currentKernel =
            this.constructor.name;

        const started =
            Date.now();

        try {

            await this.beforeExecute(context);

            await this.validate(context);

            await this.run(context);

            await this.afterExecute(context);

        } catch (error) {

            if (error instanceof Error) {

                error.message =
                    `[${this.constructor.name}] ${error.message}`;

                throw error;

            }

            throw new Error(
                `[${this.constructor.name}] ${String(error)}`
            );

        } finally {

            diagnostics.completedAt =
                Date.now();

            diagnostics.duration =
                diagnostics.completedAt - started;

            diagnostics.duration =
                diagnostics.completedAt - diagnostics.startedAt

            diagnostics.currentKernel = undefined;

        }

    }

    protected async beforeExecute(
        context: PipelineContext
    ): Promise<void> {}

    protected async validate(
        context: PipelineContext
    ): Promise<void> {}

    protected async afterExecute(
        context: PipelineContext
    ): Promise<void> {}

    protected async run(
        context: PipelineContext
    ): Promise<void>{

        const nodeId = this.requireNodeId(context);

        context.runtime.session =
            await this.provider.open(nodeId)
    };

    protected requireSession(
        context: PipelineContext
    ): BusinessSession {

        const session =
            context.runtime.session;

        if (!session) {

            throw new Error(
                "Business session has not been initialized."
            );

        }

        return session;

    }

    protected requireNodeId(
        context: PipelineContext
    ): string {

        const nodeId =
            context.runtime.nodeId;

        if (!nodeId) {

            throw new Error(
                "NodeId has not been resolved."
            );

        }

        return nodeId;

    }

    protected requireAggregate(
        context: PipelineContext
    ): AggregateRoot {

        const aggregate =
            context.runtime.aggregate;

        if (!aggregate) {

            throw new Error(
                "Aggregate has not been loaded."
            );

        }

        return aggregate;

    }

    protected hasEvents(
        context: PipelineContext
    ): boolean {

        return context.runtime.events.length > 0;

    }

    protected requireEvents(
        context: PipelineContext
    ): readonly IntegrationEvent[] {

        if (context.runtime.events.length === 0) {

            throw new Error(
                "No domain events available."
            );

        }

        return context.runtime.events;

    }

    protected requireCommand(
        context: PipelineContext
    ): Command {

        return context.request.command;

    }

    protected metadata(
        context: PipelineContext
    ): CommandMetadata {

        return context.request.metadata;

    }

    protected get kernelName(): string {

        return this.constructor.name;

    }

    protected assert(
        condition: unknown,
        message: string
    ): asserts condition {

        if (!condition) {

            throw new Error(message);

        }

    }
}