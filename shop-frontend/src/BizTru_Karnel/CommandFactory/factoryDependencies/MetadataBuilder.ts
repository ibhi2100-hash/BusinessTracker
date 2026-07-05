import { ExecutionContext } from "../ExecutionContext";

export interface CommandMetadata {

    correlationId: string;

    causationId?: string;

    logicalClock: number;

}
export interface MetadataBuilder {
    build(
        context: ExecutionContext
    ): CommandMetadata;
}