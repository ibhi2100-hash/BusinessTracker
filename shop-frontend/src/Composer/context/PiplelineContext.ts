import { ExecutionContext } from "@/src/BizTru_Karnel/KarnelTypes/types";
import { AggregateContext, BusinessContext, EventContext, PipelineRequest } from "./PipineContextContracts";

export class PipelineContext {
    constructor(
        readonly request: PipelineRequest,

        readonly execution: ExecutionContext,

        readonly business: BusinessContext,

        readonly aggregate: AggregateContext,

        readonly event: EventContext
    ){}

    
}