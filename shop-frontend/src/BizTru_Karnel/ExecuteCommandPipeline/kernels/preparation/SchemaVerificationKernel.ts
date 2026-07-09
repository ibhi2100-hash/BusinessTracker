import { PipelineKernel, PipelineContext } from "@/src/BizTru_Karnel/contracts/SubKernelContracts";
import { SchemaVerifier } from "@/src/BizTru_Karnel/contracts/SubKernelContracts";

export class SchemaVerificationKernel
implements PipelineKernel {

    constructor(
        private readonly verifier:
        SchemaVerifier
    ) {}

    async execute(
        context: PipelineContext
    ) {

        await this.verifier.verify(

            context.runtime.session!

        );

    }

}