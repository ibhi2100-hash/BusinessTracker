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


/*
 * ============================================================
 * Props
 * ============================================================
 */

interface Props {

    children:
        ReactNode;
}


/*
 * ============================================================
 * ApplicationProvider
 * ============================================================
 */

export function ApplicationProvider({
    children,
}: Props) {

    const router =
        useRouter();


    /*
     * ========================================================
     * Application state
     * ========================================================
     */

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


    /*
     * ========================================================
     * Boot state
     * ========================================================
     */

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


    /*
     * ========================================================
     * Bootstrap lifecycle
     * ========================================================
     */

    useEffect(() => {

        let mounted =
            true;


        const listener:
            BootListener = {

            /*
             * ------------------------------------------------
             * Boot started
             * ------------------------------------------------
             */

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


            /*
             * ------------------------------------------------
             * Task started
             * ------------------------------------------------
             */

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


            /*
             * ------------------------------------------------
             * Task completed
             * ------------------------------------------------
             */

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


            /*
             * ------------------------------------------------
             * Boot completed
             * ------------------------------------------------
             */

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


            /*
             * ------------------------------------------------
             * Boot failed
             * ------------------------------------------------
             */

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


        /*
         * ====================================================
         * Bootstrap
         * ====================================================
         */

        async function bootstrap():
            Promise<void> {

            try {

                /*
                 * ------------------------------------------------
                 * Construct boot manager.
                 * ------------------------------------------------
                 */

                const manager =
                    new BootManager(
                        new ClientBootstrapper(),
                        new BusinessBootstrapper()
                    );


                /*
                 * ------------------------------------------------
                 * Boot application.
                 * ------------------------------------------------
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
                 * ------------------------------------------------
                 * Store application.
                 * ------------------------------------------------
                 */

                setApplication(
                    app
                );


                /*
                 * ------------------------------------------------
                 * Application services should already be
                 * constructed by BusinessBootstrapper.
                 *
                 * Initialize synchronization application state
                 * before the UI begins consuming it.
                 * ------------------------------------------------
                 */


                
                if (!mounted) {
                    return;
                }


                /*
                 * ------------------------------------------------
                 * Restore persisted route.
                 * ------------------------------------------------
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
                 * ------------------------------------------------
                 * Application is ready.
                 * ------------------------------------------------
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


        /*
         * ====================================================
         * React cleanup
         * ====================================================
         */

        return () => {

            mounted =
                false;
        };

    }, [
        router,
    ]);


    /*
     * ========================================================
     * Boot screen
     * ========================================================
     */

    if (!ready) {

        return (
            <BootSplash
                state={boot}
            />
        );
    }


    /*
     * ========================================================
     * Defensive guard
     * ========================================================
     */

    if (
        application === null
    ) {

        return null;
    }


    /*
     * ========================================================
     * Application tree
     * ========================================================
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