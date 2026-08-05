import { CommandMetadata } from "../../BusinessClock/MetadataBuilderContract";
import { CommandContext } from "../factoryDependencies/EventContext";

export interface CommandMetadataProvider {
    build(
        context: CommandContext
    ): Promise<CommandMetadata>
}