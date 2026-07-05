import { AggregateRuntimeContext, AggregateState } from "../KarnelTypes/types";
import { Command } from "../KarnelTypes/types";
import { ExecutionPlan } from "../KarnelTypes/types";
export interface AgalrigngregateRuntime {

    execute(
        runtime: AggregateRuntimeContext<AggregateState, unknown>,
        command: Command
    ): ExecutionPlan;

}

