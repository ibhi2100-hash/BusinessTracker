import { ApplicationContext } from "../../Biztru/Composer/context/ApplicationContext"; 
import { SQLiteRuntime } from "../../Biztru/storage/runtime/SQLiteRuntime"; 
import { QueryRunner } from "../../Biztru/storage/queryRunner/QueryRunner"; 
import { TransactionManager } from "../../Biztru/storage/transaction/TransactionManager"; 

import type { DatabaseId } from "../../Biztru/storage/statement/worker/DatabaseId";

import { ClientMigrationRunner } from "../../Biztru/offline/sqlite/clientDatabase/ClientMigrationRunner"; 
import { ClientPreparedStatementManager } from "../../Biztru/offline/sqlite/clientDatabase/statements/ClientStatementManager";
import { ClientServiceRegistry } from "../../Biztru/offline/sqlite/clientDatabase/services/ClientServiceRegistry"; 
import { ClientRepositoryRegistry } from "../../Biztru/offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry"; 
import { ClientStatementDefinitions } from "../../Biztru/offline/sqlite/clientDatabase/statements/ClientStatementDefinition"; 
import { ClientStatementRegistry } from "../../Biztru/offline/sqlite/clientDatabase/statements/ClientStatementRegistry"; 
import { RegistrationService, LoginService } from "../../Biztru/offline/sqlite/clientDatabase/services/AuthService"; 
import { ExecutionContextProvider  } from "../../Biztru/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext"; 

import { ProjectionEventBus } from "@business/event-bus";

import { CurrentBusinessProjection } from "../../Biztru/offline/sqlite/clientDatabase/projections/currentBusinessProjections"; 
import { ApplicationStateProjection } from "../../Biztru/offline/sqlite/clientDatabase/projections/applicationStateProjections"; 


export class ClientBootstrapper {

   async bootstrap(): Promise<ApplicationContext> {

    const bootstrapStartedAt = performance.now();

    console.log(
        "[Bootstrap] ========================================"
    );

    console.log(
        "[Bootstrap] Starting application bootstrap..."
    );


    // ============================================================
    // 1. CREATE THE SINGLE SHARED SQLITE RUNTIME
    // ============================================================

    console.log(
        "[Bootstrap] [1/11] Initializing SQLite runtime..."
    );

    const runtimeStartedAt = performance.now();

    let runtime;

    try {

        runtime =
            await this.initializeRuntime();

        console.log(
            "[Bootstrap] [1/11] SQLite runtime initialized",
            {
                elapsedMs:
                    Math.round(
                        performance.now() - runtimeStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [1/11] FAILED: SQLite runtime initialization",
            error
        );

        throw error;
    }


    // ============================================================
    // 2. OPEN CLIENT DATABASE INSIDE THAT RUNTIME
    // ============================================================

    const clientDatabase: DatabaseId = {
        type: "client",
    };

    console.log(
        "[Bootstrap] [2/11] Opening client database...",
        {
            database: clientDatabase,
            path: "/client.db",
        }
    );

    const openDatabaseStartedAt = performance.now();

    try {

        await runtime.openDatabase(
            clientDatabase,
            "/client.db"
        );

        console.log(
            "[Bootstrap] [2/11] Client database opened",
            {
                database: clientDatabase,
                path: "/client.db",
                elapsedMs:
                    Math.round(
                        performance.now() -
                        openDatabaseStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [2/11] FAILED: Opening client database",
            {
                database: clientDatabase,
                path: "/client.db",
                error,
            }
        );

        throw error;
    }


    // ============================================================
    // 3. CREATE CLIENT-BOUND INFRASTRUCTURE
    // ============================================================

    console.log(
        "[Bootstrap] [3/11] Initializing client infrastructure..."
    );

    const infrastructureStartedAt = performance.now();

    let infrastructure;

    try {

        infrastructure =
            this.initializeInfrastructure(
                runtime,
                clientDatabase
            );

        console.log(
            "[Bootstrap] [3/11] Client infrastructure initialized",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        infrastructureStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [3/11] FAILED: Client infrastructure initialization",
            error
        );

        throw error;
    }


    // ============================================================
    // 4. MIGRATE CLIENT DATABASE
    // ============================================================

    console.log(
        "[Bootstrap] [4/11] Starting client database migration..."
    );

    const migrationStartedAt = performance.now();

    try {

        await this.migrate(
            infrastructure.queryRunner,
            infrastructure.transactionManager
        );

        console.log(
            "[Bootstrap] [4/11] Client database migration completed",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        migrationStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [4/11] FAILED: Client database migration",
            error
        );

        throw error;
    }


    // ============================================================
    // 5. REGISTER CLIENT PREPARED STATEMENTS
    // ============================================================

    console.log(
        "[Bootstrap] [5/11] Registering client prepared statements...",
        {
            statementCount:
                ClientStatementDefinitions.length,
        }
    );

    const statementsStartedAt = performance.now();

    try {

        await runtime.registerStatements(
            clientDatabase,
            ClientStatementDefinitions
        );

        console.log(
            "[Bootstrap] [5/11] Client prepared statements registered",
            {
                statementCount:
                    ClientStatementDefinitions.length,

                elapsedMs:
                    Math.round(
                        performance.now() -
                        statementsStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [5/11] FAILED: Registering client prepared statements",
            error
        );

        throw error;
    }


    // ============================================================
    // 6. CREATE APPLICATION-SIDE STATEMENT MANAGER
    // ============================================================

    console.log(
        "[Bootstrap] [6/11] Initializing statement manager..."
    );

    const statementManagerStartedAt = performance.now();

    let statementManager;

    try {

        statementManager =
            this.initializeStatements(
                infrastructure.queryRunner
            );

        console.log(
            "[Bootstrap] [6/11] Statement manager initialized",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        statementManagerStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [6/11] FAILED: Statement manager initialization",
            error
        );

        throw error;
    }


    console.log(
        "[Bootstrap] [6/11] Creating statement registry..."
    );

    const statementRegistryStartedAt = performance.now();

    let statementRegistry;

    try {

        statementRegistry =
            this.createStatementRegistry(
                statementManager
            );

        console.log(
            "[Bootstrap] [6/11] Statement registry created",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        statementRegistryStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [6/11] FAILED: Statement registry creation",
            error
        );

        throw error;
    }


    // ============================================================
    // 7. CREATE CLIENT REPOSITORIES
    // ============================================================

    console.log(
        "[Bootstrap] [7/11] Creating client repositories..."
    );

    const repositoriesStartedAt = performance.now();

    let repositories;

    try {

        repositories =
            this.createRepositories(
                statementRegistry
            );

        console.log(
            "[Bootstrap] [7/11] Client repositories created",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        repositoriesStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [7/11] FAILED: Client repository creation",
            error
        );

        throw error;
    }


    // ============================================================
    // 8. CLIENT EVENT BUS
    // ============================================================

    console.log(
        "[Bootstrap] [8/11] Creating client event bus..."
    );

    const eventBusStartedAt = performance.now();

    let bus;

    try {

        bus =
            this.createEventBus();

        console.log(
            "[Bootstrap] [8/11] Event bus created",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        eventBusStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [8/11] FAILED: Event bus creation",
            error
        );

        throw error;
    }


    console.log(
        "[Bootstrap] [8/11] Registering event consumers..."
    );

    try {

        this.registerConsumers(
            bus,
            repositories
        );

        console.log(
            "[Bootstrap] [8/11] Event consumers registered"
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [8/11] FAILED: Event consumer registration",
            error
        );

        throw error;
    }


    // ============================================================
    // 9. CLIENT SERVICES
    // ============================================================

    console.log(
        "[Bootstrap] [9/11] Creating client services..."
    );

    const servicesStartedAt = performance.now();

    let services;

    try {

        services =
            this.createServices(
                repositories
            );

        console.log(
            "[Bootstrap] [9/11] Client services created",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        servicesStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [9/11] FAILED: Client service creation",
            error
        );

        throw error;
    }


    // ============================================================
    // 10. EXECUTION CONTEXT
    // ============================================================

    console.log(
        "[Bootstrap] [10/11] Creating execution context provider..."
    );

    const executionContextStartedAt = performance.now();

    let executionContextProvider;

    try {

        executionContextProvider =
            new ExecutionContextProvider(
                repositories.executionContext
            );

        console.log(
            "[Bootstrap] [10/11] Execution context provider created"
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [10/11] FAILED: Execution context provider creation",
            error
        );

        throw error;
    }


    console.log(
        "[Bootstrap] [10/11] Initializing execution context..."
    );

    try {

        await executionContextProvider.initialize();

        console.log(
            "[Bootstrap] [10/11] Execution context initialized",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        executionContextStartedAt
                    ),
            }
        );

    } catch (error) {

        console.error(
            "[Bootstrap] [10/11] FAILED: Execution context initialization",
            error
        );

        throw error;
    }


    // ============================================================
    // 11. RETURN APPLICATION CONTEXT
    // ============================================================

    console.log(
        "[Bootstrap] [11/11] Creating application context..."
    );

    const contextStartedAt = performance.now();

    try {

        const context =
            this.createContext(
                runtime,
                clientDatabase,
                infrastructure.queryRunner,
                infrastructure.transactionManager,
                repositories,
                services,
                statementRegistry,
                executionContextProvider,
                bus
            );

        console.log(
            "[Bootstrap] [11/11] Application context created",
            {
                elapsedMs:
                    Math.round(
                        performance.now() -
                        contextStartedAt
                    ),
            }
        );


        // ========================================================
        // BOOTSTRAP COMPLETE
        // ========================================================

        console.log(
            "[Bootstrap] ========================================"
        );

        console.log(
            "[Bootstrap] BOOTSTRAP COMPLETE",
            {
                totalElapsedMs:
                    Math.round(
                        performance.now() -
                        bootstrapStartedAt
                    ),
            }
        );

        console.log(
            "[Bootstrap] ========================================"
        );


        return context;

    } catch (error) {

        console.error(
            "[Bootstrap] [11/11] FAILED: Application context creation",
            error
        );

        throw error;
    }
}


    private createContext(
        runtime: SQLiteRuntime,
        database: DatabaseId,
        queryRunner: QueryRunner,
        transactionManager: TransactionManager,
        repositoryRegistry: ClientRepositoryRegistry,
        serviceRegistry: ClientServiceRegistry,
        statementRegistry: ClientStatementRegistry,
        executionContext: ExecutionContextProvider,
        bus: ProjectionEventBus
    ) {

        return new ApplicationContext(
            runtime,
            database,
            queryRunner,
            transactionManager,
            repositoryRegistry,
            serviceRegistry,
            statementRegistry,
            executionContext,
            bus
        );
    }


    /**
     * Creates the ONE SQLiteRuntime for the application.
     *
     * No database is opened here.
     * No business database is created here.
     *
     * This creates:
     *
     * Application
     *      ↓
     * SQLiteRuntime
     *      ↓
     * SQLite Worker
     */
    private async initializeRuntime(): Promise<SQLiteRuntime> {

        const runtime =
            new SQLiteRuntime({

                vfs: "opfs",

                debug:
                    process.env.NODE_ENV === "development",
            });

        console.log("this is the runtine: ", runtime)

        await runtime.start();

        return runtime;
    }


    private initializeInfrastructure(
        runtime: SQLiteRuntime,
        database: DatabaseId
    ) {

        const queryRunner =
            new QueryRunner(
                runtime,
                database
            );

        const transactionManager =
            new TransactionManager(
                queryRunner
            );

        return {
            queryRunner,
            transactionManager,
        };
    }


    private async migrate(
        queryRunner: QueryRunner,
        transactionManager: TransactionManager
    ) {

        const runner =
            new ClientMigrationRunner(
                queryRunner
            );

        await runner.run();
    }


    private initializeStatements(
        queryRunner: QueryRunner
    ) {

        const manager =
            new ClientPreparedStatementManager(
                queryRunner
            );

        manager.initialize(
            ClientStatementDefinitions
        );

        return manager;
    }


    private createStatementRegistry(
        manager: ClientPreparedStatementManager
    ) {

        return new ClientStatementRegistry(
            manager
        );
    }


    private createRepositories(
        statements: ClientStatementRegistry
    ) {

        return new ClientRepositoryRegistry(
            statements
        );
    }


    private createServices(
        repositories: ClientRepositoryRegistry
    ) {

        const registration =
            new RegistrationService(
                repositories.users,
                repositories.session,
                repositories.applicationState
            );


        const login =
            new LoginService(
                repositories.users
            );


        return new ClientServiceRegistry(
            registration,
            login
        );
    }


    private createEventBus() {

        return new ProjectionEventBus();
    }


    private registerConsumers(
        bus: ProjectionEventBus,
        repositories: ClientRepositoryRegistry
    ) {

        bus.subscribe(
            new CurrentBusinessProjection(
                repositories.currentBusiness
            )
        );


        bus.subscribe(
            new ApplicationStateProjection(
                repositories.applicationState
            )
        );
    }
}