import { CommandDescriptor } from "../CommandDescriptor";

export interface CommandRegistry {

    register(
        type: string,
        descriptor: CommandDescriptor
    ): void;

    resolve(
        type: string
    ): CommandDescriptor;

}