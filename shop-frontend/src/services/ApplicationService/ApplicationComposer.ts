import { ClientBootstrapper } from "@/offline/bootstrap/ClientBootstrapper";
import { BusinessBootstrapper } from "@/offline/bootstrap/BusinessBootstrap";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { Application } from "./Application"


export class ApplicationComposer {
    static async compose(){
        const clientBootstrapper = 
            new ClientBootstrapper();

            const client =
                await clientBootstrapper.bootstrap();

                const businessBootstrapper =
                     new BusinessBootstrapper();

                const manager = 
                    new BusinessManager(
                        client,
                        businessBootstrapper
                    )

                await manager.initialize();
                await manager.start();

                return new Application(
                    client,
                    manager
                )
    }
}