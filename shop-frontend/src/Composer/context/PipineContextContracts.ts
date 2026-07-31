import { Command } from "@/src/BizTru_Karnel/KarnelTypes/types";
import { BusinessApplication } from "../BusinessApplicationComposer";
import { AggregateRecord } from "@/offline/domain/aggregate";
import { DomainEvent } from "@business/shared-types";

export interface PipelineRequest {

    readonly command: Command;

}

export interface BusinessContext {

    application?: BusinessApplication;

}

export interface AggregateContext {

    aggregate?: AggregateRecord;

    version?: number;

}
export interface EventContext {

    readonly events: DomainEvent[];

}