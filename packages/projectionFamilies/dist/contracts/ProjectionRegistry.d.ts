import { ProjectionHandler } from "./ProjectionHandler";
export interface ProjectionRegistry<TEvent> {
    handlers(event: TEvent): readonly ProjectionHandler<TEvent>[];
}
