import type { KnownBusiness } from "../../../../../Composer/BusinessManager";
import { KnownNodesStatements } from "../../statements/knownNodes/KnownNodesStatements";

export class SQLiteKnownNodeRepository {
    private readonly knownNodes: KnownNodesStatements;
    constructor(
        knownNodes: KnownNodesStatements
    ){
        this.knownNodes = knownNodes
    }

    async findAll(): Promise<KnownBusiness[]>{
        const businesss = await this.knownNodes.findall.query<KnownBusiness>();

        return businesss
    }
    async setCurrentBusiness(){

    }
}