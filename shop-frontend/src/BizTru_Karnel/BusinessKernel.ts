import { BusinessKernel } from "./BusinessKernelContract";
import { PipelineKernel } from "./contracts/SubKernelContracts";
import { Command } from "./KarnelTypes/types";


export class DefaultBusinessKernel
implements BusinessKernel {
  
    constructor(
          private readonly pipeline: 
        PipelineKernel
    ){}
 

    async execute(command: Command): Promise<void> {

        await this.pipeline.execute(command);
    }
}