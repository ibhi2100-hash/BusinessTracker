import {
    useCallback,
    useEffect,
    useRef,
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

import type {
    ApplicationSessionState,
} from "../../context/AplicationSessionContext";


interface Props {
    children: ReactNode;
}


export function ApplicationProvider({
    children,
}: Props) {

    const navigate = useNavigate();

    /*
     * ================================================================
     * NAVIGATION
     * ================================================================
     *
     * Keep a stable reference to the latest navigate function.
     *
     * The bootstrap effect intentionally runs once. Therefore we
     * cannot safely capture a potentially stale navigate function
     * without this ref.
     */
    const navigateRef = useRef(navigate);

    useEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);


    /*
     * ================================================================
     * APPLICATION STATE
     * ================================================================
     */

    const [
        application,
        setApplication,
    ] = useState<Application | null>(null);


    /*
     * ================================================================
     * SESSION STATE
     * ================================================================
     *
     * This is the React-facing projection of the durable session.
     *
     * IMPORTANT:
     *
     * The durable database remains the source of truth.
     *
     * This state exists so React can render the current durable
     * session without having every component directly query SQLite.
     */
    const [
        session,
        setSession,
    ] = useState<ApplicationSessionState | null>(null);


    /*
     * ================================================================
     * APPLICATION READY STATE
     * ================================================================
     *
     * The application becomes renderable only after:
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
     * ================================================================
     * BOOT STATE
     * ================================================================
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
     * ================================================================
     * SESSION REFRESH
     * ================================================================
     *
     * This function DOES NOT bootstrap the application again.
     *
     * It simply reconstructs the React-facing session from the
     * application's current durable state.
     *
     * Correct lifecycle:
     *
     * durable mutation
     *       ↓
     * runtime/business synchronization
     *       ↓
     * refreshSession()
     *       ↓
     * React receives new session
     *       ↓
     * navigation
     */
  const refreshSession = useCallback(
    async (): Promise<ApplicationSessionState> => {

        if (!application) {
            throw new Error(
                "Cannot refresh session before application is ready."
            );
        }

        const nextSession =
            await application.session.restore();

        setSession(nextSession);

        return nextSession;
    },
    [application]
);
    /*
     * ================================================================
     * APPLICATION BOOTSTRAP
     * ================================================================
     *
     * Boot happens once for this ApplicationProvider lifecycle.
     *
     * Do NOT add application/session to this dependency array.
     *
     * Doing so would cause the entire infrastructure boot pipeline
     * to execute again whenever session state changes.
     */
    useEffect(() => {

        let mounted = true;
        let cancelled = false;

        /*
         * This reference owns the application created by THIS
         * bootstrap execution.
         *
         * It is deliberately separate from React state because
         * cleanup must be able to dispose the application even
         * before setApplication() has completed.
         */
        let app: Application | undefined;


        /*
         * ------------------------------------------------------------
         * ABORT CONTROLLER
         * ------------------------------------------------------------
         */

        const controller =
            new AbortController();


        /*
         * ============================================================
         * BOOT LISTENER
         * ============================================================
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
         * ============================================================
         * BOOT PROCESS
         * ============================================================
         */

        async function bootstrap(): Promise<void> {

            try {

                /*
                 * ----------------------------------------------------
                 * 1. CREATE BOOT MANAGER
                 * ----------------------------------------------------
                 */

                const manager =
                    new BootManager(
                        new ClientBootstrapper(),
                        new BusinessBootstrapper()
                    );


                /*
                 * ----------------------------------------------------
                 * 2. EXECUTE APPLICATION BOOT PIPELINE
                 * ----------------------------------------------------
                 */

                const result =
                    await manager.boot(
                        listener,
                        controller.signal
                    );


                /*
                 * ----------------------------------------------------
                 * 3. HANDLE CANCELLATION AFTER BOOT
                 * ----------------------------------------------------
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
                 * ----------------------------------------------------
                 * 4. ACQUIRE APPLICATION
                 * ----------------------------------------------------
                 */

                app =
                    result.application;


                if (!app) {

                    throw new Error(
                        "Boot manager completed without an application."
                    );
                }


                /*
                 * ----------------------------------------------------
                 * 5. RESTORE DURABLE SESSION
                 * ----------------------------------------------------
                 *
                 * SessionApi resolves:
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
                 * ----------------------------------------------------
                 * 6. RESTORE LAST APPLICATION ROUTE
                 * ----------------------------------------------------
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
                 * ----------------------------------------------------
                 * 7. FINAL CANCELLATION CHECK
                 * ----------------------------------------------------
                 *
                 * There are multiple async boundaries above.
                 *
                 * The component may have unmounted while any of
                 * those operations were running.
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
                 * ----------------------------------------------------
                 * 8. PUBLISH APPLICATION
                 * ----------------------------------------------------
                 */

                setApplication(app);


                /*
                 * ----------------------------------------------------
                 * 9. PUBLISH SESSION
                 * ----------------------------------------------------
                 */

                setSession(
                    restoredSession
                );


                /*
                 * ----------------------------------------------------
                 * 10. MARK APPLICATION READY
                 * ----------------------------------------------------
                 */

                setReady(true);


                /*
                 * ----------------------------------------------------
                 * 11. RESTORE LAST ROUTE
                 * ----------------------------------------------------
                 *
                 * Route restoration happens only AFTER the
                 * application and session have been published.
                 *
                 * Navigation itself does not restore session state.
                 */
                if (lastRoute) {

                    navigateRef.current(
                        lastRoute,
                        {
                            replace: true,
                        }
                    );
                }

            } catch (error) {

                /*
                 * ----------------------------------------------------
                 * CANCELLATION
                 * ----------------------------------------------------
                 *
                 * Cancellation during unmount is expected.
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
                 * ----------------------------------------------------
                 * DISPOSE PARTIALLY CREATED APPLICATION
                 * ----------------------------------------------------
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


                /*
                 * ----------------------------------------------------
                 * PUBLISH BOOT FAILURE
                 * ----------------------------------------------------
                 */

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


        /*
         * ============================================================
         * START BOOT
         * ============================================================
         */

        void bootstrap();


        /*
         * ============================================================
         * CLEANUP
         * ============================================================
         */

        return () => {

            mounted = false;
            cancelled = true;

            controller.abort();


            /*
             * Dispose the application owned by this specific
             * bootstrap execution.
             *
             * This is intentionally not dependent on React state.
             */
            if (app) {

                void app
                    .client
                    .runtime
                    .dispose();

                app = undefined;
            }
        };

    }, []);


    /*
     * ================================================================
     * BOOT SCREEN
     * ================================================================
     *
     * Nothing below the application provider is rendered until the
     * infrastructure and durable session have been reconstructed.
     */
    if (!ready) {

        return (
            <BootSplash
                state={boot}
            />
        );
    }


    /*
     * ================================================================
     * DEFENSIVE READY CHECK
     * ================================================================
     *
     * `ready` and the actual state are intentionally checked
     * independently.
     */
    if (
        application === null ||
        session === null
    ) {

        return null;
    }


    /*
     * ================================================================
     * APPLICATION TREE
     * ================================================================
     */

    return (
        <Context.Provider
            value={application}
        >

            <ApplicationSessionProvider
                session={session}
                refreshSession={refreshSession}
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