import { PipelineKernel, PipelineContext } from "../../../contracts/SubKernelContracts"
import { SessionProvider } from "../../../contracts/SubKernelContracts";
export class SessionCreationKernel
implements PipelineKernel {

    constructor(

        private readonly sessions:
        SessionProvider

    ) {}

    async execute(
        context: PipelineContext
    ) {

        context.runtime.session =

            await this.sessions.open(

                context.runtime.nodeId

            );

    }

}