import { LoginService, RegistrationService } from "./AuthService";

export class ClientServieRegistry {
    readonly registration: RegistrationService;

    readonly login: LoginService
    constructor(
        registration: RegistrationService,
        login: LoginService
    ){
        this.registration = registration;

        this.login = login
    }
}