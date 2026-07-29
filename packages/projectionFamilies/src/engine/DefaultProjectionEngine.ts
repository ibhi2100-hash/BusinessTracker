import { DomainEvent } from "@business/shared-types";
import { ProjectionRegistry } from "../contracts/ProjectionRegistry";
import { ProjectionRepository } from "../contracts/ProjectionRepository";
import { ProjectionEngine } from "../contracts/projectionEngine";

export class DefaultProjectionEngine<TEvent>
implements ProjectionEngine<TEvent>{

    constructor(

        private readonly registry:
            ProjectionRegistry<TEvent>,

        private readonly repository:
            ProjectionRepository

    ){}

    async process(event: any){
        const handlers = this.registry.handlers(event);

        for(const handler of handlers) {
            const id = handler.projectionId(event);

            const current = await this.repository.load(
                handler.projection,
                id
            )

            const next = handler.reducer.reduce(
                current,
                event
            )

            await this.repository.save(
                handler.projection,
                id,
                next
            )
        }
    }

}