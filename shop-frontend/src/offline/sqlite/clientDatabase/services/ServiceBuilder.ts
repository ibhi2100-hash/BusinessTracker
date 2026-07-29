import { ClientRepositoryRegistry } from "../repositories/ClientDatabaseRepositoryRegistry";
import { LoginService, RegistrationService } from "./AuthService";
import { ClientServieRegistry } from "./ClientServiceRegistry";

export class ServiceBuilder {
    constructor(
        private readonly repositories: ClientRepositoryRegistry
    ){}

    build(){
        return new ClientServieRegistry(
            new RegistrationService(
                this.repositories.users,
                this.repositories.session
            ),
            new LoginService(
                this.repositories.users
            )
        )
    }
}