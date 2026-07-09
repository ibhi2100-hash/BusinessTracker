import { ExecutionEngine } from "../contracts/SubKernelContracts";
import { PreparationPhase } from "../contracts/SubKernelContracts";
import { PersistencePhase } from "../contracts/SubKernelContracts";
import { CompletionPhase } from "../contracts/SubKernelContracts";
import { DomainPhase } from "../contracts/SubKernelContracts";
import { RollbackPhase } from "../contracts/SubKernelContracts";

export class DefaultExecutionEngine
implements ExecutionEngine {

    constructor(

        private readonly preparation: PreparationPhase,

        private readonly domain: DomainPhase,

        private readonly persistence: PersistencePhase,

        private readonly completion: CompletionPhase,

        private readonly rollback: RollbackPhase

    ) {}



}