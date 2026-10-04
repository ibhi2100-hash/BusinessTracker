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

        let runtime: SQLiteRuntime | undefined;
        let ownershipTransferred = false;

        try {

            runtime = await this.initializeRuntime();

            const clientDatabase: DatabaseId = {
                type: "client",
            };

            await runtime.openDatabase(
                clientDatabase,
                "/client.db"
            );

            const infrastructure =
                this.initializeInfrastructure(
                    runtime,
                    clientDatabase
                );

            await this.migrate(
                infrastructure.queryRunner
            );

            await runtime.registerStatements(
                clientDatabase,
                ClientStatementDefinitions
            );

            const statementManager =
                this.initializeStatements(
                    infrastructure.queryRunner
                );

            const statementRegistry =
                this.createStatementRegistry(
                    statementManager
                );

            const repositories =
                this.createRepositories(
                    statementRegistry
                );

            const bus =
                this.createEventBus();

            this.registerConsumers(
                bus,
                repositories
            );

            const services =
                this.createServices(
                    repositories
                );

            const executionContextProvider =
                new ExecutionContextProvider(
                    repositories.executionContext
                );

            await executionContextProvider.initialize();

            const context =
                this.createContext(
                    runtime,
                    infrastructure.queryRunner,
                    infrastructure.transactionManager,
                    repositories,
                    services,
                    statementRegistry,
                    executionContextProvider,
                    bus
                );

            // ApplicationContext now owns runtime.
            ownershipTransferred = true;

            return context;

        } catch (error) {

            if (runtime && !ownershipTransferred) {

                try {
                    await runtime.dispose();
                } catch (disposeError) {
                    console.error(
                        "[Bootstrap] Failed to dispose runtime after bootstrap failure",
                        disposeError
                    );
                }
            }

            throw error;
        }
    }


    private createContext(
        runtime: SQLiteRuntime,
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
                repositories.applicationState,
                repositories.currentSession
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