import { PipelineContext, PipelinePhase } from "../../contracts/SubKernelContracts";

export abstract class AbstractPipelinePhase 
implements PipelinePhase {
    protected abstract readonly kernels:
    readonly PipelinePhase[];

    async execute(context: PipelineContext): Promise<void> {
        for(const kernel of this.kernels){
            await kernel.execute(context)
        }
    }
}