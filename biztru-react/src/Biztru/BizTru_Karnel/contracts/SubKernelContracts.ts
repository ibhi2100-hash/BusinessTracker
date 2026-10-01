
import type { Command } from "../KarnelTypes/types";


export interface PipelineKernel {

    execute(
        command: Command
    ): Promise<void>;

}
export interface CommandValidator {

    validate(
        command: Command
    ): Promise<void>;

}