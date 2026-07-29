
import { BusinessSession } from "./BusinessSessionContract";
import { BusinessStorageSession} from "../../worker/sessions/BusinessStorageSession"
import { BusinessConnectionPool } from "../../businessDatabase/engine/ConnectionManager";

export class BusinessSessionManager
implements BusinessSession {
    private static instance: BusinessSessionManager;

    //Map all Active Business Session;

    private sessions: Map<string, BusinessStorageSession> = new Map();

    private currentSession: BusinessStorageSession | null = null;

    private currentNodeId: string | null = null;

    static getInstance():BusinessSessionManager{
        if(!BusinessSessionManager.instance){
            BusinessSessionManager.instance = new BusinessSessionManager()
        };
        return BusinessSessionManager.instance
    };
    //Get or Create Session for a specific Business

    async getSession(nodeId: string): Promise<BusinessStorageSession>{
        //Return Existing Session if available
        if(this.sessions.has(nodeId)){
            console.log(`[SessionManager] Reusing session for node-${nodeId}`);
            return this.sessions.get(nodeId)
        };
        console.log(`[SessionManager] Creating Session for node-${nodeId}`);
        const pool = BusinessConnectionPool.getInstance();
        console.log("Pool of connection is about to be Connected: ", pool)
        const connection = await pool.getConnection(nodeId);
        console.log("Connection is made for this dataBase: ", connection)
        const session = new BusinessStorageSession(nodeId, connection);

        await session.initialize();
        this.sessions.set(nodeId, session);
        return session;
    }

    async switchTo(nodeId: string): Promise<BusinessStorageSession>{
        console.log(`[SessionManager] Switching to node-${nodeId}`);

        const session = await this.getSession(nodeId);
        this.currentSession = session;
        this.currentNodeId = nodeId;

        return session
    }

    getCurrentSession(): BusinessStorageSession | null {
        return this.currentSession;
    }

    getCurrentNodeId(): string | null {
        return this.currentNodeId;
    }

    async closeSession(nodeId: string):Promise<void> {
        const session = this.sessions.get(nodeId);
        if(session){
            await session.dispose();
            this.sessions.delete(nodeId);

            if(this.currentNodeId === nodeId)
            {
                this.currentSession = null;
                this.currentNodeId = null
            }
        }
    }

    async closeAll(): Promise<void> {
        for (const [nodeId, session] of this.sessions){
            await session.dispose();
        };
        this.sessions.clear();
        this.currentSession = null;
        this.currentNodeId = null;
    }

    getActiveNodes(): string[] {
        return Array.from(this.sessions.keys());
    }

    hasSession(nodeId: string): boolean {
        return this.sessions.has(nodeId)
    }
    
    async execute(
        operation: string,
        params: any,
        nodeId?: string
    ):Promise<any>{
        const session = nodeId
            ? await this.getSession(nodeId)
            : this.currentSession

            if(!session){
                throw new Error("No active business Session")
            }

            switch (operation) {
                case "query":
                    return session.query(
                        params.sql, 
                        params.params
                    )
                case "execute":
                    return session.execute(
                        params.sql, 
                        params.params
                    );
                case "scalar":
                    return session.scalar(
                        params.sql,
                        params.params
                    )
            
                default:
                    throw new Error(`Unknown Operation: ${operation}`)
            }
    }

    async createBusiness(
    nodeId: string
): Promise<BusinessStorageSession> {
    console.log("Creating Business Session: ", nodeId)
    if (this.sessions.has(nodeId)) {

        throw new Error(
            `Business ${nodeId} already exists.`
        );

    }

    const session =
        await this.getSession(nodeId);

    this.currentSession = session;
    this.currentNodeId = nodeId;

    return session;
}
}