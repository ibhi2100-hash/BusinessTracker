import { BusinessSession } from "@/src/BizTru_Karnel/contracts/SubKernelContracts";
import { ClientSession } from "./ClientStorageSession";

export class SessionManager {
    private client: ClientSession;
   
    private node =
        new Map<string, BusinessSession>()
    
    private activeNodeId: 
        string | null = null;

    async initialize(){
        await this.client.initialize()
    }
}