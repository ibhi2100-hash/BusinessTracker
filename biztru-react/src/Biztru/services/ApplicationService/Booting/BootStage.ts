import { ApplicationContext } 
    from "../../../Composer/context/ApplicationContext";

import { Application } 
    from "../Application";

import { BusinessManager } 
    from "../../../Composer/BusinessManager";

import type { CurrentBusiness } 
    from "../../../offline/sqlite/clientDatabase/repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";


/* =========================================================
   BOOT STAGES
   ========================================================= */

export const BootStage = {

    STARTING:
        "STARTING",

    OPENING_CLIENT_DATABASE:
        "OPENING_CLIENT_DATABASE",

    RUNNING:
        "RUNNING",

    LOADING_CONFIGURATION:
        "LOADING_CONFIGURATION",

    RESTORING_BUSINESSES:
        "RESTORING_BUSINESSES",

    OPENING_CURRENT_BUSINESS:
        "OPENING_CURRENT_BUSINESS",

    STARTING_EVENT_BUS:
        "STARTING_EVENT_BUS",

    COMPLETED:
        "COMPLETED",

    FAILED:
        "FAILED",

} as const;


/*
 * A single boot-stage value.
 *
 * Example:
 *
 * BootStage.FAILED
 *
 * has type:
 *
 * "FAILED"
 */

export type BootStageType =
    typeof BootStage[keyof typeof BootStage];


/* =========================================================
   STARTUP DESTINATIONS
   ========================================================= */

export const StartupDestination = {

    HOME:
        "/",

    ONBOARD:
        "/onboard",

    DASHBOARD:
        "/dashboard",

    RECOVERY:
        "/recovery",

} as const;


export type StartupDestinationType =
    typeof StartupDestination[
        keyof typeof StartupDestination
    ];


/* =========================================================
   BOOT RESULT
   ========================================================= */

export interface BootResult {

    application:
        Application;

    destination:
        StartupDestinationType;

    diagnostics?:
        BootDiagnostics;

    report:
        BootReport;
}


/* =========================================================
   BOOT CONTEXT
   ========================================================= */

export interface BootContext {

    infrastructure: {

        client?:
            ApplicationContext;

    };

    runtime: {

        businessManager?:
            BusinessManager;

        currentBusiness?:
            CurrentBusiness;

    };

    output: {

        application?:
            Application;

        destination?:
            StartupDestinationType;

    };
}


/* =========================================================
   BOOT TASK
   ========================================================= */

export interface BootTask {

    readonly id:
        string;

    readonly title:
        string;

    readonly weight:
        number;

    execute(
        context: BootContext
    ): Promise<void>;
}


/* =========================================================
   BOOT PROGRESS
   ========================================================= */
export interface BootProgress {
    taskId: string;
    taskTitle: string;
    stage: BootStageType;
    percentage: number;
    completed: number;
    total: number;
    elapsed: number;
}

/* =========================================================
   BOOT DIAGNOSTICS
   ========================================================= */

export interface BootDiagnostics {

    runtime:
        boolean;

    clientDatabase:
        boolean;

    migrations:
        boolean;

    repositories:
        boolean;

    services:
        boolean;

    businessManager:
        boolean;

    businessDatabase:
        boolean;

    executionContext:
        boolean;
}


/* =========================================================
   BOOT LISTENER
   ========================================================= */

export interface BootListener {

    onStarted(
        totalTasks: number
    ): void;

    onTaskStarted(
        task: BootTask,
        progress: BootProgress
    ): void;

    onTaskCompleted(
        task: BootTask,
        progress: BootProgress
    ): void;

    onCompleted(
        result: BootResult
    ): void;

    onFailed(
        error: unknown
    ): void;
}


/* =========================================================
   BOOT TASK REPORT
   ========================================================= */

export interface BootTaskReport {

    id:
        string;

    title:
        string;

    duration:
        number;

    success:
        boolean;

    error?:
        string;
}


/* =========================================================
   BOOT REPORT
   ========================================================= */

export interface BootReport {

    startedAt:
        number;

    finishedAt:
        number;

    duration:
        number;

    tasks:
        readonly BootTaskReport[];
}


/* =========================================================
   BOOT PIPELINE MIDDLEWARE
   ========================================================= */

export interface BootPipelineMiddleware {

    beforeTask(
        task: BootTask,
        context: BootContext
    ): Promise<void>;

    afterTask(
        task: BootTask,
        context: BootContext,
        duration: number
    ): Promise<void>;

    onError(
        task: BootTask,
        error: unknown
    ): Promise<void>;
}


/* =========================================================
   BOOT STATE
   ========================================================= */

export interface BootState {

    stage:
        BootStageType;

    progress:
        number;

    title:
        string;

    completed:
        boolean;

    totalTasks:
        number;

    completedTasks:
        number;

    error?:
        string;
}
