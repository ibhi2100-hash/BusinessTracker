import { PipelineKernel, PipelineContext } from "@/src/BizTru_Karnel/contracts/SubKernelContracts";
import { StatementInitializer } from "@/src/BizTru_Karnel/contracts/SubKernelContracts";

export class PreparedStatementKernel
implements PipelineKernel {

    constructor(
        private readonly statements:
        StatementInitializer
    ) {}

    async execute(
        context: PipelineContext
    ) {

        await this.statements.initialize(

            context.runtime.session!

        );

    }

}