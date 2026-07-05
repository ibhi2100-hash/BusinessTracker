import { CommandDescriptor } from "./CommandDescriptor";


export interface CommandRegistry {

    register(
        descriptor: CommandDescriptor<any>
    ): void;

    resolve(
        type: string
    ): CommandDescriptor<any>;

}