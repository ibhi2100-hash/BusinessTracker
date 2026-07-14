import { CommandContext } from "../factoryDependencies/EventContext";

export interface CommandContextProvider {
    current(): Promise<CommandContext>
}