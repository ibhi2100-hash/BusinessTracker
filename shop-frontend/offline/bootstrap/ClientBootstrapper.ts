import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";

import { SQLiteRuntime } from "@/src/storage/runtime/SQLiteRuntime";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";

import type { DatabaseId } from "@/src/storage/statement/worker/DatabaseId";

import { ClientMigrationRunner } from "@/src/offline/sqlite/clientDatabase/ClientMigrationRunner";

import { ClientPreparedStatementManager } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementManager";
import { ClientServiceRegistry } from "@/src/offline/sqlite/clientDatabase/services/ClientServiceRegistry";
import { ClientRepositoryRegistry } from "@/src/offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry";
import { ClientStatementDefinitions } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementDefinition";
import { ClientStatementRegistry } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementRegistry";

import {
    RegistrationService,
    LoginService,
} from "@/src/offline/sqlite/clientDatabase/services/AuthService";

import { ExecutionContextProvider } from "@/src/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";

import { ProjectionEventBus } from "@business/event-bus";

import { CurrentBusinessProjection } from "@/src/offline/sqlite/clientDatabase/projections/currentBusinessProjections";
import { ApplicationStateProjection } from "@/src/offline/sqlite/clientDatabase/projections/applicationStateProjections";


export class ClientBootstrapper {

    async bootstrap(): Promise<ApplicationContext> {

        // ============================================================
        // 1. CREATE THE SINGLE SHARED SQLITE RUNTIME
        // ============================================================

        const runtime =
            await this.initializeRuntime();


        // ============================================================
        // 2. OPEN CLIENT DATABASE INSIDE THAT RUNTIME
        // ============================================================

        const clientDatabase: DatabaseId = {
            type: "client",
        };

        await runtime.openDatabase(
            clientDatabase,
            "/client.db"
        );


        // ============================================================
        // 3. CREATE CLIENT-BOUND INFRASTRUCTURE
        // ============================================================

        const infrastructure =
            this.initializeInfrastructure(
                runtime,
                clientDatabase
            );


        // ============================================================
        // 4. MIGRATE CLIENT DATABASE
        // ============================================================

        await this.migrate(
            infrastructure.queryRunner,
            infrastructure.transactionManager
        );


        // ============================================================
        // 5. REGISTER CLIENT PREPARED STATEMENTS
        // ============================================================

        await runtime.registerStatements(
            clientDatabase,
            ClientStatementDefinitions
        );


        // ============================================================
        // 6. CREATE APPLICATION-SIDE STATEMENT MANAGER
        // ============================================================

        const statementManager =
            this.initializeStatements(
                infrastructure.queryRunner
            );


        const statementRegistry =
            this.createStatementRegistry(
                statementManager
            );


        // ============================================================
        // 7. CREATE CLIENT REPOSITORIES
        // ============================================================

        const repositories =
            this.createRepositories(
                statementRegistry
            );


        // ============================================================
        // 8. CLIENT EVENT BUS
        // ============================================================

        const bus =
            this.createEventBus();


        this.registerConsumers(
            bus,
            repositories
        );


        // ============================================================
        // 9. CLIENT SERVICES
        // ============================================================

        const services =
            this.createServices(
                repositories
            );


        // ============================================================
        // 10. EXECUTION CONTEXT
        // ============================================================

        const executionContextProvider =
            new ExecutionContextProvider(
                repositories.executionContext
            );

        await executionContextProvider.initialize();


        // ============================================================
        // 11. RETURN APPLICATION CONTEXT
        // ============================================================

        return this.createContext(
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

                vfs: "opfs-sahpool",

                debug:
                    process.env.NODE_ENV === "development",
            });

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