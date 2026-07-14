import { PipelineContext, PipelineKernel, SessionFactory } from "../../../contracts/SubKernelContracts";

export class SessionInitializationKarnel
implements PipelineKernel {
    constructor(
        private readonly sessions:
        SessionFactory
    ){}

    async execute(context: PipelineContext): Promise<void> {
        const session =
            await this.sessions.create(
                context.runtime.nodeId
            )

        context.runtime.session =
            session

    }
    
}