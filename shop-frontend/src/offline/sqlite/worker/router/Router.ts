import { resolveEngine } from "./EngineResolver";
import { resolveHandler } from "./HandlerResolver";
import { WorkerRequest } from "../../protocol/WorkerRequest";
import { WorkerResponse } from "../../protocol/WorkerResponse";


export class WorkerRouter {
  async routeRequest(request: WorkerRequest) {

    const engine = 
      resolveEngine(request.database);
    
    const handler =
      resolveHandler(request.operation);

    const result =
      await handler(engine, request.payload);

    return {
      id: request.id,
      result: result
    } as WorkerResponse;

  }
}