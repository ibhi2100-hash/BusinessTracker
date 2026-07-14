import { BusinessKernel } from "./BusinessKernelContract";
import { PipelineContextFactory, PipelineKernel } from "./contracts/SubKernelContracts";
import { Command } from "./KarnelTypes/types";

export class DefaultBusinessKernel
implements BusinessKernel {

    constructor(
        private readonly pipeline: 
        PipelineKernel,

        private readonly contextFactory:
        PipelineContextFactory
    ){}

    async execute<TResult>(command: Command): Promise<TResult> {
        const context =
            this.contextFactory.create(command)

        await this.pipeline.execute(context);

        return context.result as TResult
    }
}