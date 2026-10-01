import type { Kernel } from "./BusinessKernelContract";
import type{ PipelineKernel } from "./contracts/SubKernelContracts";
import type{ Command } from "./KarnelTypes/types";


export class DefaultBusinessKernel
implements Kernel {
  
    constructor(
          private readonly pipeline: 
        PipelineKernel
    ){}
 

    async execute(command: Command): Promise<void> {

        await this.pipeline.execute(command);
    }
}