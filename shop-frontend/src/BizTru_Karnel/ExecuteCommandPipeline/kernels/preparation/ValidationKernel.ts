import { KernelResult, PipelineContext, PipelineKernel } from "../../../contracts/SubKernelContracts";
import { CommandValidator } from "../../../contracts/SubKernelContracts";

export class CommandValidationKernel
implements PipelineKernel {

    constructor(

        private readonly validator:
        CommandValidator

    ) {}

    async execute(
        context: PipelineContext
    ): Promise<void> {

        const result = await this.validator.validate(
            context.request.command
        ) 

    }

}