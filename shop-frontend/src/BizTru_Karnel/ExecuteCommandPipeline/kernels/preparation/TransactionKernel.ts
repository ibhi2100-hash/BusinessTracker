import { PipelineContext, PipelineKernel, TransactionScope } from "../../../contracts/SubKernelContracts";

export class TransactionBeginKernel 
implements PipelineKernel   {
    constructor(
        private readonly transactions:
        TransactionScope
    ){}

    async execute(context: PipelineContext): Promise<void> {
        await this.transactions.begin(
            context.runtime.session

        )

    }
}