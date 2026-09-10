import { DomainEvent } from "@business/shared-types";
import { Command } from "../KarnelTypes/types";
import { EventRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteEventRepository/contracts";


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