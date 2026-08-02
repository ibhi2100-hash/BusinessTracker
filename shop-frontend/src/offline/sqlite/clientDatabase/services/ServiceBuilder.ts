import { ClientRepositoryRegistry } from "../repositories/ClientDatabaseRepositoryRegistry";
import { LoginService, RegistrationService } from "./AuthService";
import { ClientServieRegistry } from "./ClientServiceRegistry";

export class ServiceBuilder {
    constructor(
        private readonly repositories: ClientRepositoryRegistry
    ){}

    build(){
         console.log(this.repositories);
    console.log(this.repositories.applicationState);

        return new ClientServieRegistry(
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