import { PipelineContext, PipelineKernel } from "../../../contracts/SubKernelContracts";
import { ExecutionKernel } from "../ExecutionKernel";

export class MigrationKernel
extends ExecutionKernel {
    protected async run(context: PipelineContext): Promise<void> {
        
        await context.runtime.session.initialize()
    }
}