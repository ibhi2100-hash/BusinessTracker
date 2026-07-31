"use client"

import { createContext, useEffect, useState } from "react"
import { ApplicationContext } from "@/src/Composer/context/ApplicationContexts";
import { ClientBootstrapper } from "@/offline/bootstrap/ClientBootstrapper";
import { Session } from "inspector/promises";
import { ExecutionContextProvider } from "@/src/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";
import { BusinessBootstrapper } from "@/offline/bootstrap/BusinessBootstrap";
import { BusinessManager } from "@/src/Composer/BusinessManager";


export const BootstrapContext =
    createContext<ApplicationContext | null>(null)

export function BootstrapProvider({
    children
}:{
    children: React.ReactNode;
}){

    const [context, setContext] =
        useState<ApplicationContext | null>(null);

    useEffect(() => {

        async function boot(){

            const bootstrapper =
                new ClientBootstrapper();

            const app =
                await bootstrapper.bootstrap();
            setContext(app);

            const businessBootstrapper = new BusinessBootstrapper();

            const businessManager = new BusinessManager(
                app,
                businessBootstrapper
            )

            await businessManager.initialize()

        }

        boot();

    }, []);

    if(!context){

        return <>Loading...</>;

    }

    return (

        <BootstrapContext.Provider value={context}>

            {children}

        </BootstrapContext.Provider>

    );

}