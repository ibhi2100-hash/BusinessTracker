import  { PipelinePhase } from "../contracts/SubKernelContracts";
import { PipelineKernel } from "../contracts/SubKernelContracts";

export abstract class ExecutionPhase
implements PipelinePhase {
    protected abstract kernel:
        readonly PipelineKernel[];
}