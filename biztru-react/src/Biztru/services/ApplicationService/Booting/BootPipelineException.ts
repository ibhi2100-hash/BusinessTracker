import type{ BootTask } from "./BootStage";

export class BootPipelineException
extends Error {
    readonly task: BootTask;
    readonly cause: unknown;
    readonly duration: number
    constructor(
        task: BootTask,

        cause: unknown,

        duration : number
    ){ 
        super(
            `Boot task '$${task.title}' failed.`
        )

        this.task = task;

        this.cause = cause;

        this.duration = duration
    }


}