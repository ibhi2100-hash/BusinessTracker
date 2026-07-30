"use client"

import { createContext, useEffect, useState } from "react"
import { ApplicationContext } from "@/src/Composer/context/ApplicationContexts";
import { ClientBootstrapper } from "@/offline/bootstrap/ClientBootstrapper";
import { Session } from "inspector/promises";


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
                
            const session =await app.repositories.session.getCurrentSession();
            if(!session){
                throw new Error("Session is Required please get the hell out of here ")
            }
            console.log("This is the session UserId", session)
            const user =await app.repositories.users.findById(session.userId)
            console.log("This is the user from database: ", user)
            const executionContext = 
                await app.repositories.executionContext.getCurrentContext()
            console.log("This is the context that happen periviously:", executionContext)
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