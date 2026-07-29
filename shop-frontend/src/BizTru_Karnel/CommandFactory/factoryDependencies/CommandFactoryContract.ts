import { Command } from "../../KarnelTypes/types";
import { CommandIntent } from "../CommandIntent";

export interface CommandFactory {

    create<TPayload>(

        intent: CommandIntent<TPayload>

    ): Promise<Command<TPayload>>;

}