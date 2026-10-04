import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        /*
         * DEVELOPMENT
         *
         * Remove previously installed production
         * service workers from localhost.
         */
        if (import.meta.env.DEV) {
            void navigator.serviceWorker
                .getRegistrations()
                .then(async (registrations) => {
                    for (const registration of registrations) {
                        await registration.unregister();
                    }

                    console.log(
                        "[SW] Development service workers cleared"
                    );
                })
                .catch((error) => {
                    console.error(
                        "[SW] Failed to clear development registrations:",
                        error
                    );
                });

            return;
        }

        /*
         * PRODUCTION
         */
        void navigator.serviceWorker
            .register("/sw.js", {
                scope: "/",
            })
            .then((registration) => {
                console.log(
                    "[SW] Production service worker registered:",
                    registration.scope
                );

                /*
                 * Detect a newly downloaded service worker.
                 */
                registration.addEventListener(
                    "updatefound",
                    () => {
                        const newWorker =
                            registration.installing;

                        if (!newWorker) {
                            return;
                        }

                        newWorker.addEventListener(
                            "statechange",
                            () => {
                                console.log(
                                    "[SW] New worker state:",
                                    newWorker.state
                                );
                            }
                        );
                    }
                );
            })
            .catch((error) => {
                console.error(
                    "[SW] Production registration failed:",
                    error
                );
            });
    }, []);

    return null;
}