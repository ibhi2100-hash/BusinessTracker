"use client"

import { createContext, useEffect, useState } from "react"
import { ApplicationContext } from "@/src/Composer/context/ApplicationContexts";
import { ClientBootstrapper } from "@/offline/bootstrap/ClientBootstrapper";


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