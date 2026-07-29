import { resolveEngine } from "./EngineResolver";
import { resolveHandler } from "./HandlerResolver";
import { WorkerRequest } from "../../protocol/WorkerRequest";
import { WorkerOperation } from "../../protocol/WorkerOperation";
import { DatabaseTarget } from "../../protocol/DatabaseTarget";
import { WorkerResponse } from "../../protocol/WorkerResponse";
import { BusinessSessionManager } from "../sessions/BusinessSessionManager";
import { BusinessConnectionPool } from "../../businessDatabase/engine/ConnectionManager";


export class WorkerRouter {
  private activeNodeId: string | null = null;

  async routeRequest(request: WorkerRequest): Promise<WorkerResponse> {
    try {
      if(request.database === DatabaseTarget.BUSINESS){
        return await this.handleBusinessRequest(request)
      }

      return await  this.handleClientRequest(request)
      
    } catch (error) {
      return {
        id: request.id,
        error: error instanceof Error ? error.message : "unknown error"
      } as WorkerResponse
    }
  }

  private async handleBusinessRequest(request: WorkerRequest): Promise<WorkerResponse>{
    const sessionManager = BusinessSessionManager.getInstance();

      switch(request.operation){
        case WorkerOperation.OPEN_NODE:
          //Switch to specified business node
          const nodeId = request.payload.nodeId;

          await sessionManager.switchTo(nodeId);
          this.activeNodeId =  nodeId;

          return {
            id: request.id,
            result: { activeNode: nodeId}
          }
        case WorkerOperation.CLOSE_NODE:
          if(this.activeNodeId){
            await sessionManager.closeSession(this.activeNodeId);
            this.activeNodeId = null;

          }
          return {
            id: request.id,
            result: { activeNode: null}
          }
        case WorkerOperation.QUERY:
        case WorkerOperation.EXECUTE:
        case WorkerOperation.SCALAR:
        case WorkerOperation.EXISTS:
        
          //Execute on current Active Node

          if(!this.activeNodeId){
            throw new Error("No active businessNode")
          }

          const result = await sessionManager.execute(request.operation, request.payload, this.activeNodeId);

          return {
            id: request.id,
            result
          }

        case WorkerOperation.LIST_NODES:
          const pool = 
            BusinessConnectionPool.getInstance();

            return {
              id: request.id,
              result: {
                activeNodes: pool.getActiveNodes(),
                current: this.activeNodeId
              }
            }

        default:
          throw new Error(`Unknown Business Operation: ${ request.operation}`)
      }
  }

  private async handleClientRequest(request: WorkerRequest): Promise<WorkerResponse>{
    const engine = resolveEngine(DatabaseTarget.CLIENT);
    const handler = resolveHandler(request.operation);

    const result = await handler(engine, request.payload)

    return {
      id: request.id,
      result
    }

  }


  }
