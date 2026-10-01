import { ClientRepositoryRegistry } from "../repositories/ClientDatabaseRepositoryRegistry";
import { LoginService, RegistrationService } from "./AuthService";
import { ClientServiceRegistry } from "./ClientServiceRegistry";

export class ServiceBuilder {
    constructor(
        private readonly repositories: ClientRepositoryRegistry
    ){}

    build(){

        return new ClientServiceRegistry(
            new RegistrationService(
                this.repositories.users,
                this.repositories.session,
                this.repositories.applicationState
            ),
            new LoginService(
                this.repositories.users
            )
        )
    }
}