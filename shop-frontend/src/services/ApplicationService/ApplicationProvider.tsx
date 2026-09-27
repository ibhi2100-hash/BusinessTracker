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

    const router = useRouter();

    const [
        application,
        setApplication,
    ] = useState<Application | null>(null);

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

        let cancelled = false;

        let mounted = true;

        /*
         * The local application reference owns the runtime created
         * by this effect.
         *
         * Do NOT use React state inside cleanup because the cleanup
         * closure can contain the initial null value.
         */
        let app: Application | undefined;


        const listener: BootListener = {

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


        async function bootstrap(): Promise<void> {

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


                /*
                 * The effect may have been cleaned up while booting.
                 *
                 * In that case React no longer owns this application,
                 * so dispose it immediately instead of putting it
                 * into state.
                 */
                if (cancelled) {

                    if (result.application) {

                        await result
                            .application
                            .client
                            .runtime
                            .dispose();
                    }

                    return;
                }


                /*
                 * Keep the application in this effect's local scope
                 * so cleanup can dispose the exact runtime that this
                 * effect created.
                 */
                app =
                    result.application;


                if (!app) {
                    throw new Error(
                        "Boot manager completed without an application."
                    );
                }


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


                /*
                 * The component may have unmounted while the route
                 * was being restored.
                 */
                if (cancelled || !mounted) {

                    await app
                        .client
                        .runtime
                        .dispose();

                    app = undefined;

                    return;
                }


                /*
                 * ====================================================
                 * APPLICATION READY
                 * ====================================================
 */

                setApplication(
                    app
                );

                setReady(
                    true
                );


                /*
                 * Only navigate after the application has successfully
                 * completed bootstrapping and its runtime is retained.
                 */
                router.replace(
                    lastRoute
                );

            } catch (error) {

                /*
                 * If the effect was already cancelled, don't update
                 * React state and don't report cancellation as a boot
                 * failure.
                 */
                if (cancelled) {
                    return;
                }

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
         * ============================================================
         * EFFECT CLEANUP
         * ============================================================
         *
         * React cleanup must be synchronous.
         *
         * We cannot:
         *
         *     return async () => {}
         *
         * because React does not treat an async cleanup function as
         * a normal cleanup callback.
         */
        return () => {

            mounted =
                false;

            cancelled =
                true;


            /*
             * app may still be undefined if boot is in progress.
             *
             * If boot has already completed, dispose the exact runtime
             * created by this effect.
             */
            if (app) {

                void app
                    .client
                    .runtime
                    .dispose();

                app =
                    undefined;
            }
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