import { BusinessRuntime } from "@/src/storage/runtime/BusinessRuntime";
import { BusinessPreparedStatementManager } from "../statements/PreparedStatementManager";
import { BusinessRepositoryRegistry } from "../repositories/RepositoryRegistry";
import { Lifecycle } from "../../lifecycle/LifeCycle";
import { BusinessStatementRegistry } from "../statements/StatementRegistry";
import { BusinessMigrationRunner } from "../engine/MigrationManager";
import { BusinessStatementDefinition } from "../statements/business/BusinessDefiinition";

export class BusinessStorage
implements Lifecycle {

    constructor(
        readonly runtime: BusinessRuntime,

        readonly migrationRunner: BusinessMigrationRunner,

        readonly statements: BusinessStatementRegistry,

        readonly statementManager: BusinessPreparedStatementManager,

        readonly repositories: BusinessRepositoryRegistry,

    ){}

    async initialize(): Promise<void> {
        await this.runtime.initialize();

        await this.migrationRunner.run();

        this.statementManager.initialize(
            BusinessStatementDefinition
        )
    }

    async start(): Promise<void> {
        
    }

    async stop(): Promise<void> {
        
    }

    async dispose(): Promise<void> {
        this.statementManager.clear();

        await this.runtime.dispose();
    }
}