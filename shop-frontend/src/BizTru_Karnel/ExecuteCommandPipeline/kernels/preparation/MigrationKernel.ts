import { DatabaseInitializer, KernelResult, PipelineContext, PipelineKernel } from "../../../contracts/SubKernelContracts";

export class MigrationKernel
implements PipelineKernel {
    constructor(
        private readonly initializer:
        DatabaseInitializer
    ){}

    async execute(context: PipelineContext): Promise<void> {
        await this.initializer.initialize(
            context.runtime.session
        )
        
    }
}