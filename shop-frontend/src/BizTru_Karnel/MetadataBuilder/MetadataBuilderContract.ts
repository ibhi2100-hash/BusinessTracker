import { CommandMetadata } from "./CommandMetadata";

export interface MetadataBuilderContract {
    build(): Promise<CommandMetadata>;
}