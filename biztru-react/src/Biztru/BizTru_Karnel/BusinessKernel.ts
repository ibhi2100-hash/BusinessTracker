import type { Kernel } from "./BusinessKernelContract";
import type{ PipelineKernel } from "./contracts/SubKernelContracts";
import type{ Command } from "./KarnelTypes/types";


export class DefaultBusinessKernel
implements Kernel {
    private readonly pipeline: PipelineKernel
    constructor(
          pipeline: 
        PipelineKernel
    ){
        this.pipeline = pipeline
    }
 

    async execute(command: Command): Promise<void> {

        await this.pipeline.execute(command);
    }
}