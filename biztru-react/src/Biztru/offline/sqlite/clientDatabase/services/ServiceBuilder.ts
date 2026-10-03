import { ClientRepositoryRegistry } from "../repositories/ClientDatabaseRepositoryRegistry";
import { LoginService, RegistrationService } from "./AuthService";
import { ClientServiceRegistry } from "./ClientServiceRegistry";

export class ServiceBuilder {
    private readonly repositories: ClientRepositoryRegistry;
    constructor(
        repositories: ClientRepositoryRegistry
    ){
        this.repositories = repositories;
    }

    build(){

        return new ClientServiceRegistry(
            new RegistrationService(
                this.repositories.users,
                this.repositories.session,
                this.repositories.applicationState,
                this.repositories.currentSession
            ),
            new LoginService(
                this.repositories.users
            )
        )
    }
}