import { Business } from "@business/shared-types";
import { KnownNodesStatements } from "../../statements/knownNodes/KnownNodesStatements";

export class SQLiteKnownNodeRepository {
    constructor(
        private readonly knownNodes: KnownNodesStatements
    ){}

    async findAll(): Promise<KnownBusiness[]>{
        const businesss = await this.knownNodes.findall.query<KnownBusiness>();

        return businesss
    }
    async setCurrentBusiness(businessId: string){

    }
}