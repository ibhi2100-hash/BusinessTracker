import {
    DatabaseTarget
} from "./DatabaseTarget";

import {
    WorkerOperation
} from "./WorkerOperation";

export interface WorkerRequest {

    readonly id: string;

    readonly database: DatabaseTarget;

    readonly operation: WorkerOperation;

    readonly payload?: any;

}