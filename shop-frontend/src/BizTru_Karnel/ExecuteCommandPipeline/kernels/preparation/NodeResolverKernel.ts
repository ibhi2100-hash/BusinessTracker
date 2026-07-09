import { KernelResult, NodeResolver, PipelineContext, PipelineKernel } from "../../../contracts/SubKernelContracts";

export class NodeResolutionKernel 
implements PipelineKernel {
    constructor(
        private readonly resolver:
        NodeResolver
    ){}

    async execute(context: PipelineContext): Promise<void> {
        const nodeId =
            await this.resolver.resolve(
                context.request.command.businessId
            );

        context.runtime.nodeId = 
            nodeId;

    }
}