import { BootTask } from "./BootStage";

export class BootPipelineException
extends Error {
    constructor(
        readonly task: BootTask,

        readonly cause: unknown,

        readonly duration: number
    ){
        super(
            `Boot task '$${task.title}' failed.`
        )
    }


}