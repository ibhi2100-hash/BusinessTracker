import { StorageBus } from "./StorageBus";

let storage: StorageBus | null = null;

export function StorageBusCreator() {

    if (!storage) {

        const worker = new Worker(
            new URL("../worker/worker.ts", import.meta.url),
            {
                type: "module",
            }
        );

        storage = new StorageBus(worker);
    }

    return storage;
}