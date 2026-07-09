/// <reference lib="webworker"/>

import { WorkerRouter } from "./router/Router";
import { WorkerRequest } from "../protocol/WorkerRequest";
import { WorkerResponse } from "../protocol/WorkerResponse";

const router =
    new WorkerRouter();

self.onmessage = async (
    event: MessageEvent<WorkerRequest>
) => {

    const request =
        event.data;

    try {

        const response =
            await router.routeRequest(request);

        self.postMessage(response);

    } catch (error) {

        self.postMessage({

            id: request.id,

            error:
                error instanceof Error
                    ? error.message
                    : String(error)

        } satisfies WorkerResponse);

    }

};