import {
    useEffect,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import Context from "./ApplicationContext";

import type {
    Application,
} from "./Application";

import {
    BootManager,
} from "./Booting/BootManager";

import type {
    BootListener,
    BootState,
} from "./Booting/BootStage";

import {
    BootStage,
} from "./Booting/BootStage";

import {
    ClientBootstrapper,
} from "../../../offline/bootstrap/ClientBootstrapper";

import {
    BusinessBootstrapper,
} from "../../../offline/bootstrap/BusinessBootstrap";

import {
    BootSplash,
} from "./Booting/components/BootSplash";

import {
    ApplicationSessionProvider,
} from "../../../components/providers/ApplicationSessionProvider";

import {
    SyncProvider,
} from "../../../components/providers/SyncProvider";

import type { ApplicationSessionState } from "../../context/AplicationSessionContext";
interface Props {
    children: ReactNode;
}


export function ApplicationProvider({
    children,
}: Props) {

    const navigate = useNavigate();

    /*
     * ============================================================
     * APPLICATION STATE
     * ============================================================
     */

    const [
        application,
        setApplication,
    ] = useState<Application | null>(null);

    /*
     * React-facing projection of the durable application session.
     *
     * The durable source of truth remains client.db.
     * This state only represents the restored session for React.
     */
    const [
        session,
        setSession,
    ] = useState<ApplicationSessionState | null>(null);

    /*
     * The application becomes ready only after:
     *
     * 1. Client infrastructure has booted.
     * 2. Business infrastructure has been restored.
     * 3. Application has been created.
     * 4. Durable session has been restored.
     */
    const [
        ready,
        setReady,
    ] = useState(false);


    /*
     * ============================================================
     * BOOT STATE
     * ============================================================
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
     * ============================================================
     * APPLICATION BOOTSTRAP
     * ============================================================
     */

    useEffect(() => {

        let mounted = true;
        let cancelled = false;

        /*
         * This reference owns the application created by
         * this particular effect execution.
         *
         * This is intentionally not React state because cleanup
         * must always have access to the application created by
         * this bootstrap attempt.
         */
        let app: Application | undefined;

        const controller =
            new AbortController();


        /*
         * ========================================================
         * BOOT LISTENER
         * ========================================================
         */

        const listener: BootListener = {

            onStarted(totalTasks) {

                if (!mounted) {
                    return;
                }

                setBoot(previous => ({
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
                }));
            },


            onTaskStarted(
                task,
                progress
            ) {

                if (!mounted) {
                    return;
                }

                setBoot(previous => ({
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
                }));
            },


            onTaskCompleted(
                task,
                progress
            ) {

                if (!mounted) {
                    return;
                }

                setBoot(previous => ({
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
                }));
            },


            onCompleted() {

                if (!mounted) {
                    return;
                }

                setBoot(previous => ({
                    ...previous,

                    stage:
                        BootStage.COMPLETED,

                    progress:
                        100,

                    completed:
                        true,
                }));
            },


            onFailed(error) {

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
            },
        };


        /*
         * ========================================================
         * BOOT PROCESS
         * ========================================================
         */

        async function bootstrap(): Promise<void> {

            try {

                /*
                 * ------------------------------------------------
                 * 1. Create boot manager
                 * ------------------------------------------------
                 */

                const manager =
                    new BootManager(
                        new ClientBootstrapper(),
                        new BusinessBootstrapper()
                    );


                /*
                 * ------------------------------------------------
                 * 2. Execute application boot pipeline
                 * ------------------------------------------------
                 */

                const result =
                    await manager.boot(
                        listener,
                        controller.signal
                    );


                /*
                 * ------------------------------------------------
                 * 3. Handle cancellation after boot
                 * ------------------------------------------------
                 */

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


                /*
                 * ------------------------------------------------
                 * 4. Acquire application
                 * ------------------------------------------------
                 */

                app =
                    result.application;


                if (!app) {

                    throw new Error(
                        "Boot manager completed without an application."
                    );
                }


                /*
                 * ------------------------------------------------
                 * 5. Restore durable application session
                 * ------------------------------------------------
                 *
                 * SessionApi restores:
                 *
                 * client_session
                 *       ↓
                 * user
                 *       ↓
                 * business
                 *       ↓
                 * branch
                 *       ↓
                 * ApplicationSessionState
                 */

                const restoredSession =
                    await app.session.restore();


                /*
                 * ------------------------------------------------
                 * 6. Restore last application route
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


                /*
                 * ------------------------------------------------
                 * 7. Check cancellation after all async work
                 * ------------------------------------------------
                 */

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


                /*
                 * ------------------------------------------------
                 * 8. Publish fully reconstructed state
                 * ------------------------------------------------
                 *
                 * React must not render the application tree
                 * until both application and session exist.
                 */

                setApplication(app);
                setSession(restoredSession);


                /*
                 * ------------------------------------------------
                 * 9. Application is now ready
                 * ------------------------------------------------
                 */

                setReady(true);

                if(lastRoute){
                    navigate(lastRoute)
                }

            } catch (error) {

                /*
                 * Cancellation is expected during unmount,
                 * especially under React StrictMode.
                 */
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


                /*
                 * If application creation succeeded but a later
                 * bootstrap step failed, release the application
                 * resources before exposing the failure.
                 */
                if (app) {

                    try {

                        await app
                            .client
                            .runtime
                            .dispose();

                    } catch (disposeError) {

                        console.error(
                            "Failed to dispose application after boot failure:",
                            disposeError
                        );
                    }

                    app = undefined;
                }


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


        /*
         * ========================================================
         * CLEANUP
         * ========================================================
         */

        return () => {

            mounted = false;
            cancelled = true;

            controller.abort();


            /*
             * Dispose the application owned by this bootstrap
             * execution.
             */
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
     * DEFENSIVE READY CHECK
     * ============================================================
     */

    if (
        application === null ||
        session === null
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
            value={application}
        >

            <ApplicationSessionProvider
                session={session}
            >

                <SyncProvider
                    syncService={
                        application.syncService
                    }
                >

                    {children}

                </SyncProvider>

            </ApplicationSessionProvider>

        </Context.Provider>
    );
}