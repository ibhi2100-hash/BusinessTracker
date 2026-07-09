import { ExecutionContext } from "../CommandFactory/ExecutionContext/ExecutionContextContract";

export interface CommandMetadata {

    correlationId: string;

    causationId?: string;

    logicalClock: number;

}
export interface MetadataBuilderContract {
    build(
        context: ExecutionContext
    ): CommandMetadata;
}