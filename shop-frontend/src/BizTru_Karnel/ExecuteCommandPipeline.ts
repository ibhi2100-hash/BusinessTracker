import { PipelineKernel } from "./contracts/SubKernelContracts";

export class ExecuteCommandPipeline {

    constructor(

        private readonly kernels:
        readonly PipelineKernel[]

    ) {}

}
