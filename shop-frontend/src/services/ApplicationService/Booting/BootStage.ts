import { ApplicationContext } from "@/src/Composer/context/ApplicationContext";
import { Application } from "../Application";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { CurrentBusiness } from "@/src/offline/sqlite/clientDatabase/repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";

export enum BootStage {

    STARTING,

    OPENING_CLIENT_DATABASE,

    RUNNING,

    LOADING_CONFIGURATION,

    RESTORING_BUSINESSES,

    OPENING_CURRENT_BUSINESS,

    STARTING_EVENT_BUS,

    COMPLETED,

    FAILED

}
export interface BootResult{

    application:Application;

    destination:StartupDestination;

    diagnostics?:BootDiagnostics;

    report: BootReport;

}
export enum StartupDestination {

    HOME = "/",

    ONBOARD = "/onboard",

    DASHBOARD = "/dashboard",

    RECOVERY = "/recovery"

}

export interface BootContext {
    infrastructure: {
        client?: ApplicationContext;
    };

    runtime: {
        businessManager?: BusinessManager;
        currentBusiness?: CurrentBusiness;
    };

    output: {
        application?: Application;
        destination?: StartupDestination;
    };
}


export interface BootTask{

    readonly id: string;

    readonly title: string;

    readonly weight: number;

    execute(
        context: BootContext
    ): Promise<void>;

}

export interface BootProgress{
    taskId: string;
    taskTitle: string;

    stage?: BootStage;

    percentage:number;

    completed:number;

    total:number;

    elapsed: number;

}
export interface BootDiagnostics{

    runtime:boolean;

    clientDatabase:boolean;

    migrations:boolean;

    repositories:boolean;

    services:boolean;

    businessManager:boolean;

    businessDatabase:boolean;

    executionContext:boolean;

}

export interface BootListener{

    onStarted(
        totalTasks:number
    ):void;

    onTaskStarted(
        task:BootTask,
        progress:BootProgress
    ):void;

    onTaskCompleted(
        task:BootTask,
        progress:BootProgress
    ):void;

    onCompleted(
        result:BootResult
    ):void;

    onFailed(
        error:unknown
    ):void;

}

export interface BootTaskReport {

    id: string;

    title: string;

    duration: number;

    success: boolean;

    error?: string

}

export interface BootReport {

    startedAt: number;

    finishedAt: number;

    duration: number;

    tasks: readonly BootTaskReport[];

}

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
export interface BootState {

    stage: BootStage;

    progress: number;

    title: string;

    completed: boolean;

    totalTasks: number;

    completedTasks: number;

    error?: string;

}