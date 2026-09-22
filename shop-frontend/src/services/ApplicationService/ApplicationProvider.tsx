"use client";

import {
    ReactNode,
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import Context from "./ApplicationContext";

import type {
    Application,
} from "./Application";

import {
    BootManager,
} from "./Booting/BootManager";

import {
    BootListener,
    BootStage,
    BootState,
} from "./Booting/BootStage";

import {
    ClientBootstrapper,
} from "@/offline/bootstrap/ClientBootstrapper";

import {
    BusinessBootstrapper,
} from "@/offline/bootstrap/BusinessBootstrap";

import {
    BootSplash,
} from "./Booting/components/BootSplash";

import {
    SyncProvider,
} from "@/components/providers/SyncProvider";


interface Props {
    children: ReactNode;
}


export function ApplicationProvider({
    children,
}: Props) {

    const router =
        useRouter();


    const [
        application,
        setApplication,
    ] = useState<Application | null>(
        null
    );


    const [
        ready,
        setReady,
    ] = useState(false);


    const [
        boot,
        setBoot,
    ] = useState<BootState>({

        stage:
            BootStage.STARTING,

        progress:
            0,

        title:
            "Starting BizTru...",

        completed:
            false,

        totalTasks:
            0,

        completedTasks:
            0,
    });


    useEffect(() => {

        let mounted = true;


        const listener:
            BootListener = {

            onStarted(
                totalTasks
            ) {

                if (!mounted) {
                    return;
                }


                setBoot(
                    previous => ({

                        ...previous,

                        stage:
                            BootStage.STARTING,

                        totalTasks,

                        completedTasks:
                            0,

                        progress:
                            0,

                        title:
                            "Starting BizTru...",

                        completed:
                            false,

                        error:
                            undefined,
                    })
                );
            },


            onTaskStarted(
                task,
                progress
            ) {

                if (!mounted) {
                    return;
                }


                setBoot(
                    previous => ({

                        ...previous,

                        stage:
                            progress.stage,

                        title:
                            task.title,

                        progress:
                            progress.percentage,

                        completedTasks:
                            Math.round(
                                progress.completed
                            ),

                        totalTasks:
                            Math.round(
                                progress.total
                            ),
                    })
                );
            },


            onTaskCompleted(
                task,
                progress
            ) {

                if (!mounted) {
                    return;
                }


                setBoot(
                    previous => ({

                        ...previous,

                        stage:
                            progress.stage,

                        title:
                            task.title,

                        progress:
                            progress.percentage,

                        completedTasks:
                            Math.round(
                                progress.completed
                            ),

                        totalTasks:
                            Math.round(
                                progress.total
                            ),
                    })
                );
            },


            onCompleted() {

                if (!mounted) {
                    return;
                }


                setBoot(
                    previous => ({

                        ...previous,

                        stage:
                            BootStage.COMPLETED,

                        progress:
                            100,

                        completed:
                            true,
                    })
                );
            },


            onFailed(
                error
            ) {

                if (!mounted) {
                    return;
                }


                setBoot(
                    previous => ({

                        ...previous,

                        stage:
                            BootStage.FAILED,

                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    })
                );
            },
        };


        async function bootstrap():
            Promise<void> {

            try {

                /*
                 * ====================================================
                 * CREATE BOOT MANAGER
                 * ====================================================
                 */

                const manager =
                    new BootManager(
                        new ClientBootstrapper(),
                        new BusinessBootstrapper()
                    );


                /*
                 * ====================================================
                 * BOOT APPLICATION
                 * ====================================================
                 */

                const result =
                    await manager.boot(
                        listener
                    );


                if (!mounted) {
                    return;
                }


                const app =
                    result.application;


                /*
                 * ====================================================
                 * INITIALIZE APPLICATION SYNC SERVICE
                 * ====================================================
                 *
                 * At this point all local infrastructure should
                 * already have been constructed by the bootstrapper.
                 */


                if (!mounted) {
                    return;
                }

                
                if (!mounted) {
                    return;
                }


                /*
                 * ====================================================
                 * PUBLISH APPLICATION
                 * ====================================================
                 */

                setApplication(
                    app
                );


                /*
                 * ====================================================
                 * RESTORE LAST ROUTE
                 * ====================================================
                 */

                const {
                    lastRoute,
                } =
                    await app
                        .client
                        .repositories
                        .applicationState
                        .getLastRoute();


                if (!mounted) {
                    return;
                }


                /*
                 * ====================================================
                 * APPLICATION READY
                 * ====================================================
 */

                setReady(
                    true
                );


                router.replace(
                    lastRoute
                );

            } catch (error) {

                console.error(
                    "Application bootstrap failed:",
                    error
                );


                if (!mounted) {
                    return;
                }


                setBoot(
                    previous => ({

                        ...previous,

                        stage:
                            BootStage.FAILED,

                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    })
                );
            }
        }


        void bootstrap();


        return () => {

            mounted =
                false;
        };

    }, [
        router,
    ]);


    /*
     * ============================================================
     * BOOT SCREEN
     * ============================================================
     */

    if (!ready) {

        return (
            <BootSplash
                state={boot}
            />
        );
    }


    /*
     * ============================================================
     * DEFENSIVE GUARD
     * ============================================================
     */

    if (
        application === null
    ) {

        return null;
    }


    /*
     * ============================================================
     * APPLICATION TREE
     * ============================================================
     */

    return (

        <Context.Provider
            value={
                application
            }
        >

            <SyncProvider
                syncService={
                    application.syncService
                }
            >

                {children}

            </SyncProvider>

        </Context.Provider>
    );
}