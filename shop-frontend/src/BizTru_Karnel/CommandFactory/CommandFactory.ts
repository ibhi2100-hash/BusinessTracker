import { DomainEvent } from "@business/shared-types";
import { Command } from "../KarnelTypes/types";
import { CommandIntent } from "./CommandIntent";

export interface EventFactory {

    create<TPayload>(

        intent: CommandIntent<TPayload>

    ): DomainEvent<TPayload>;

}