"use client";

import {
    useEffect,
    useState,
    ReactNode
} from "react";

import { useRouter } from "next/navigation";

import Context, { useApplication } from "./ApplicationContext";
import type { Application } from "./Application";

import { BootManager } from "./Booting/BootManager";

import {
    BootListener,
    BootStage,
    BootState,
} from "./Booting/BootStage";

import { ClientBootstrapper } from "@/offline/bootstrap/ClientBootstrapper";
import { BusinessBootstrapper } from "@/offline/bootstrap/BusinessBootstrap";

import { BootSplash } from "./Booting/components/BootSplash";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { BusinessSynchronization } from "@/src/offline/sqlite/businessDatabase/synchronization/BusinessSynchronization";

interface Props {
    children: ReactNode;
}

export function ApplicationProvider({
    children
}: Props) {

    const router = useRouter();
    const [ ready, setReady ] = useState(false)
    const [application, setApplication] =
        useState<Application | null>(null);
    const [
        synchronization,
        setSynchronization
            ] =
        useState<BusinessSynchronization | null>(null);


    const [boot, setBoot] =
        useState<BootState>({

            stage: BootStage.STARTING,

            progress: 0,

            title: "Starting BizTru...",

            completed: false,

            totalTasks: 0,

            completedTasks: 0

        });

    useEffect(() => {

        let mounted = true;

        const listener: BootListener = {

            onStarted(totalTasks) {

                if (!mounted) return;

                setBoot(previous => ({
                    ...previous,

                    stage: BootStage.STARTING,

                    totalTasks,

                    completedTasks: 0,

                    progress: 0,

                    title: "Starting BizTru..."

                }));

            },

            onTaskStarted(task, progress) {

                if (!mounted) return;

                setBoot(previous => ({

                    ...previous,

                    stage: progress.stage,

                    title: task.title,

                    progress: progress.percentage,

                    completedTasks: Math.round(progress.completed),

                    totalTasks: Math.round(progress.total)

                }));

            },

            onTaskCompleted(task, progress) {

                if (!mounted) return;

                setBoot(previous => ({

                    ...previous,

                    stage: progress.stage,

                    title: task.title,

                    progress: progress.percentage,

                    completedTasks: Math.round(progress.completed),

                    totalTasks: Math.round(progress.total)

                }));

            },

            onCompleted(result) {

                if (!mounted) return;

                setBoot(previous => ({

                    ...previous,

                    stage: BootStage.COMPLETED,

                    progress: 100,

                    completed: true

                }));

            },

            onFailed(error) {

                if (!mounted) return;

                setBoot(previous => ({

                    ...previous,

                    stage: BootStage.FAILED,

                    error: String(error)

                }));

            }

        };

        async function bootstrap() {

            try {

                const manager =
                    new BootManager(
                        new ClientBootstrapper(),
                        new BusinessBootstrapper()
                    );

                const result =
                    await manager.boot(listener);

                if (!mounted) {
                    return;
                }

                /*
                 * ----------------------------------------------
                 * Obtain the already constructed synchronization
                 * subsystem from the application.
                 * ----------------------------------------------
                 */

                const app = result.application;

                setApplication(
                    app
                );

                try {

                    const sync =
                        await app.sync.Sync();

                    if (mounted) {

                        setSynchronization(
                            sync
                        );
                    }

                } catch (error) {

                    /*
                     * Synchronization must never prevent the
                     * application from starting.
                     */

                    console.warn(
                        "Business synchronization unavailable during startup.",
                        error
                    );

                    if (mounted) {

                        setSynchronization(
                            null
                        );
                    }
                }

                                /*
                 * ------------------------------------------------
                 * Restore navigation AFTER client boot.
                 * ------------------------------------------------
                 */

                const {
                    lastRoute
                } =
                    await app
                        .client
                        .repositories
                        .applicationState
                        .getLastRoute();


                if (mounted) {

                    setReady(
                        true
                    );

                router.replace(
                        lastRoute
                    );
                }

            } catch (error) {
                console.error(
                        "Application bootstrap failed:",
                        error
                    );

            }

        }

        bootstrap();

        return () => {

            mounted = false;

        };

    }, [router]);

    if (!ready) {

        return (
            <BootSplash
                state={boot}
            />
        );

    }

     if (
        !application
    ) {

        return null;
    }

    /* This is the onboarding state.
     * ----------------------------------------------------------
     */

    if (!synchronization) {

        return (
            <Context.Provider
                value={application}
            >
                {children}
            </Context.Provider>
        );
    }
    return (

        <Context.Provider
            value={
                application
            }
        >

            <SyncProvider
                synchronization={
                    synchronization
                }
            >

                {children}

            </SyncProvider>

        </Context.Provider>

    );

}