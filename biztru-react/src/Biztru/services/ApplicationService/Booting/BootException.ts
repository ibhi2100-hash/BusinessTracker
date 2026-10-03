export class BootPipelineException extends Error {
    readonly taskId: string;

    constructor(
        taskId: string,
        error: any,
        options?: { cause?: unknown }
    ) {
        super(error, options);
        this.name = "BootPipelineException";
        this.taskId = taskId;
    }
}