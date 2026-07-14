import { PipelineContext, PipelineKernel } from "@/src/BizTru_Karnel/contracts/SubKernelContracts";

export class ConnectionOpenKernel
implements PipelineKernel {
    async execute(context: PipelineContext): Promise<void> {
        
        await context.runtime
            .session!
            .initialize()
    }
}