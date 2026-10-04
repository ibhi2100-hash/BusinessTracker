import { BusinessRuntime } from "../../../../storage/runtime/BusinessRuntime"; 
import { BusinessPreparedStatementManager } from "../statements/PreparedStatementManager";
import { BusinessRepositoryRegistry } from "../repositories/RepositoryRegistry";
import type{ Lifecycle } from "../../lifecycle/LifeCycle";
import { BusinessStatementRegistry } from "../statements/StatementRegistry";
import { BusinessMigrationRunner } from "../engine/MigrationManager";
import { BusinessStatementsDefinitions } from "../statements/BusinessStatementsDefinition";

export class BusinessStorage
implements Lifecycle {
    readonly migrationRunner: BusinessMigrationRunner

    readonly statements: BusinessStatementRegistry;

    readonly runtime: BusinessRuntime;

    readonly statementManager: BusinessPreparedStatementManager;

    readonly repositories: BusinessRepositoryRegistry


    constructor(
        runtime: BusinessRuntime,

        migrationRunner: BusinessMigrationRunner,

        statements: BusinessStatementRegistry,

        statementManager: BusinessPreparedStatementManager,

        repositories: BusinessRepositoryRegistry,

    ){
        this.runtime = runtime;

        this.migrationRunner = migrationRunner;

        this.statements = statements;
        
        this.statementManager = statementManager;

        this.repositories = repositories
    }

    async initialize(): Promise<void> {
        await this.runtime.initialize();

        await this.migrationRunner.run();

        await this.runtime.sqlite.registerStatements(
            this.runtime.database,
            BusinessStatementsDefinitions
        )

        await this.statementManager.initialize(
            BusinessStatementsDefinitions
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