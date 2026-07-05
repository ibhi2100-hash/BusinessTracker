import { PayloadSchema } from "../KarnelTypes/types";   
import { BusinessOperation } from "../KarnelTypes/types";
import { AggregateRebuilder } from "../KarnelTypes/types";  

export interface CommandDescriptor<
    TState,
    TCommand
>{

    readonly type:string;

    readonly aggregateType:string;

    readonly aggregateId:string;

    readonly permission:string;

    readonly schema:PayloadSchema;

    readonly operation:BusinessOperation<
        TState,
        TCommand
    >;

    readonly rebuilder:AggregateRebuilder<
        TState
    >;

}