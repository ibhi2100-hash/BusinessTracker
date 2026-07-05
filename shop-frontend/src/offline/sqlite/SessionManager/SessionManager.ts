import { BusinessSession } from "../worker/sessions/BusinessStorageSession";
import { ClientSession } from "../worker/sessions/ClientStorageSession";


export class SessionManager {
    private client: ClientSession;

    private nodes: Map<string, BusinessSession> = new Map<string, BusinessSession>();

    private activeNodeId: string | null = null;

    async initialize() {

    }

    currentNode(){
        if(!this.activeNodeId){
            throw new Error("No active node");
        }
        const node = this.nodes.get(this.activeNodeId);
        if(!node){
            throw new Error("No node found for active node id");
        }
        return node;
    }

}