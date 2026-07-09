import { AbstractPipelinePhase } from "../AbstractPhase/AbstractPhase";
import { PipelineKernel, PipelinePhase, PreparationPhase } from "../../contracts/SubKernelContracts";
import { CommandValidationKernel } from "../kernels/preparation/ValidationKernel";
import { NodeResolutionKernel } from "../kernels/preparation/NodeResolverKernel";
import { SessionInitializationKarnel } from "../kernels/preparation/SessionKernel";
import { MigrationKernel } from "../kernels/preparation/MigrationKernel";
import { TransactionBeginKernel } from "../kernels/preparation/TransactionKernel";

export class DefaultPreparationPhase
extends AbstractPipelinePhase
implements PreparationPhase {

    constructor(

        private readonly validation: CommandValidationKernel,

        private readonly nodeResolver: NodeResolutionKernel,

        private readonly sessionKernel: SessionInitializationKarnel,

        private readonly migrationKernel: MigrationKernel,

        private readonly transactionKernel: TransactionBeginKernel

    ) {

        super();

        this.kernels = [

            validation,

            nodeResolver,

            sessionKernel,

            migrationKernel,

            transactionKernel

        ];

    }

    protected readonly kernels: readonly PipelinePhase[];

}