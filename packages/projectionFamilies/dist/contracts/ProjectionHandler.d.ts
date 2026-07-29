import { ProjectionReducer } from "./ProjectionReducer";
export interface ProjectionHandler<TEvent> {
    readonly projection: string;
    supports(event: TEvent): boolean;
    projectionId(event: TEvent): string;
    reducer: ProjectionReducer<any, TEvent>;
}
