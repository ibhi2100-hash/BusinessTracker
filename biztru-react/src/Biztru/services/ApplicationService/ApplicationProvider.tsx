import {
    useEffect,
    useState,
} from "react";
import type {
      ReactNode
} from "react"
import { useNavigate } from "react-router-dom";
import Context from "./ApplicationContext";

import type {
    Application,
} from "./Application";

import {
    BootManager,
} from "./Booting/BootManager";

import type{
    BootListener,
    BootState,
} from "./Booting/BootStage";
import { BootStage } from "./Booting/BootStage";
import { ClientBootstrapper } from "../../../offline/bootstrap/ClientBootstrapper";

import { BusinessBootstrapper } from "../../../offline/bootstrap/BusinessBootstrap";
import {
    BootSplash,
} from "./Booting/components/BootSplash";

import { SyncProvider } from "../../../components/providers/SyncProvider";
import { SQLiteRuntime } from "../../storage/runtime/SQLiteRuntime";

interface Props {
    children: ReactNode;
}


export function ApplicationProvider({
    children,
}: Props) {

    const navigate = useNavigate();

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

        const controller = new AbortController();


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

            const manager =
                new BootManager(
                    new ClientBootstrapper(),
                    new BusinessBootstrapper()
                );

            const result =
                await manager.boot(
                    listener,
                    controller.signal
                );

            if (
                cancelled ||
                controller.signal.aborted
            ) {
                if (result.application) {
                    await result
                        .application
                        .client
                        .runtime
                        .dispose();
                }

                return;
            }

            app = result.application;

            if (!app) {
                throw new Error(
                    "Boot manager completed without an application."
                );
            }
            await app.session.restore();
            
            const { lastRoute } =
                await app
                    .client
                    .repositories
                    .applicationState
                    .getLastRoute();

            if (
                cancelled ||
                !mounted ||
                controller.signal.aborted
            ) {

                await app
                    .client
                    .runtime
                    .dispose();

                app = undefined;

                return;
            }

            setApplication(app);
            setReady(true);

            navigate(lastRoute);

        } catch (error) {

            if (
                cancelled ||
                controller.signal.aborted
            ) {
                return;
            }

            console.error(
                "Application bootstrap failed:",
                error
            );

            if (!mounted) {
                return;
            }

            setBoot(previous => ({
                ...previous,

                stage:
                    BootStage.FAILED,

                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            }));
        }
    }

    void bootstrap();

    return () => {

        mounted = false;
        cancelled = true;

        controller.abort();

        if (app) {
            void app
                .client
                .runtime
                .dispose();

            app = undefined;
        }
    };

}, [navigate]);


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