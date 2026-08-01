import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";
import { SQLiteRuntime } from "@/src/storage/runtime/SQLiteRuntime";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { ClientMigrationRunner } from "@/src/offline/sqlite/clientDatabase/ClientMigrationRunner";
import { ClientPreparedStatementManager } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementManager";
import { ClientServieRegistry } from "@/src/offline/sqlite/clientDatabase/services/ClientServiceRegistry";
import { ClientRepositoryRegistry } from "@/src/offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry";
import { ClientStatementDefinitions } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementDefinition";
import { ClientStatementRegistry } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementRegistry";
import { RegistrationService } from "@/src/offline/sqlite/clientDatabase/services/AuthService";
import { LoginService } from "@/src/offline/sqlite/clientDatabase/services/AuthService";
import { ExecutionContextProvider } from "@/src/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";


export class ClientBootstrapper {
    async bootstrap(): Promise<ApplicationContext> {
        const runtime = 
            await this.initializeRuntime();

        const infrastructure =
            await this.initializeInfrastructure(
                runtime
            )
        await this.migrate(infrastructure.queryRunner,
            infrastructure.transactionManager
        );

        const statementManager =
            this.initializeStatements(
                infrastructure.queryRunner
            )

        const statementRegistry = 
            this.createStatementRegistry(
                statementManager
            );
        
        const repositories = 
            this.createRepositories(
                statementRegistry
            );
        
        const services = 
            this.createServices(
                repositories
            );
        const executionContextProvider =
            new ExecutionContextProvider(repositories.executionContext)

        await executionContextProvider.initialize()
        return this.createContext(
            runtime,
            infrastructure.queryRunner,
            infrastructure.transactionManager,
            repositories,
            services,
            statementRegistry,
            executionContextProvider
        ) 
            
    }
    private createContext(
        runtime: SQLiteRuntime,
        queryRunner: QueryRunner,
        transactionManager: TransactionManager,
        repositoryRegistry: ClientRepositoryRegistry,
        serviceRegistry: ClientServieRegistry,
        statementRegistry: ClientStatementRegistry,
        executionContext: ExecutionContextProvider
    ){
        return new ApplicationContext(
            runtime,
            queryRunner,
            transactionManager,
            repositoryRegistry,
            serviceRegistry,
            statementRegistry,
            executionContext
        )
    }
   
    private async initializeRuntime(): Promise<SQLiteRuntime> {

        const runtime = new SQLiteRuntime({
            filename: "/client.db"
        });

        await runtime.initialize();

        return runtime;

    }

    private initializeInfrastructure(
        runtime: SQLiteRuntime
    ) {

        const queryRunner =
            new QueryRunner(runtime);

        const transactionManager =
            new TransactionManager(queryRunner);

        return {

            queryRunner,
            transactionManager

        };



    }

    private async migrate(
        queryRunner: QueryRunner,
        transactionManager: TransactionManager
    ) {

        const runner =
            new ClientMigrationRunner(
                queryRunner,
                transactionManager
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
                repositories.session
            );

        const login =
            new LoginService(
                repositories.users
            );

        return new ClientServieRegistry(

            registration,

            login

        );

    }
            

}