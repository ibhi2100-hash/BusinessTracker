import { DomainEvent } from "@business/shared-types";
import { ProjectionRegistry } from "../contracts/ProjectionRegistry";
import { ProjectionHandler } from "../contracts/ProjectionHandler";

export class DefaultProjectionRegistry
implements ProjectionRegistry<DomainEvent> {
    private readonly map =
        new Map<
            string,
            ProjectionHandler<DomainEvent>[]
        >()

        handlers(event: DomainEvent<unknown>): readonly ProjectionHandler<DomainEven>[] {
            
        }
}