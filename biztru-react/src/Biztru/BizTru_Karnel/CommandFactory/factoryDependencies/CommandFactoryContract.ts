import type { Command } from "../../KarnelTypes/types";
import type { CommandIntent } from "../CommandIntent";

export interface CommandFactory {

    create<TPayload>(

        intent: CommandIntent<TPayload>

    ): Promise<Command<TPayload>>;

}