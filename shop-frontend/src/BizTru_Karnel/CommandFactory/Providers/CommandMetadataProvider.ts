import { CommandMetadata } from "../../MetadataBuilder/MetadataBuilderContract";
import { CommandContext } from "../factoryDependencies/EventContext";

export interface CommandMetadataProvider {
    build(
        context: CommandContext
    ): Promise<CommandMetadata>
}