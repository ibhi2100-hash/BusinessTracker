"use client";

import {
    useEffect,
    useState,
    ReactNode
} from "react";

import { useRouter } from "next/navigation";

import Context from "./ApplicationContext";
import type { Application } from "./Application";

import { BootManager } from "./Booting/BootManager";

import {
    BootListener,
    BootStage,
    BootState
} from "./Booting/BootStage";

import { ClientBootstrapper } from "@/offline/bootstrap/ClientBootstrapper";
import { BusinessBootstrapper } from "@/offline/bootstrap/BusinessBootstrap";

import { BootSplash } from "./Booting/components/BootSplash";

interface Props {
    children: ReactNode;
}

export function ApplicationProvider({
    children
}: Props) {

    const router = useRouter();

    const [application, setApplication] =
        useState<Application | null>(null);

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

                setApplication(
                    result.application
                );

                router.replace(
                    result.destination
                );

            } catch (error) {

                console.error(error);

            }

        }

        bootstrap();

        return () => {

            mounted = false;

        };

    }, [router]);

    if (!application) {

        return (
            <BootSplash
                state={boot}
            />
        );

    }

    return (

        <Context.Provider value={application}>

            {children}

        </Context.Provider>

    );

}