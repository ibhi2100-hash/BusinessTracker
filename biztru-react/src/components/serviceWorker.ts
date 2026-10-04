import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        if (import.meta.env.DEV) {
            void navigator.serviceWorker
                .getRegistrations()
                .then(async (registrations) => {
                    for (const registration of registrations) {
                        await registration.unregister();
                    }
                })
                .catch((error) => {
                    console.error(
                        "[SW] Failed to unregister service worker:",
                        error
                    );
                });

            return;
        }

        void navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log(
                    "[SW] Production service worker registered:",
                    registration.scope
                );
            })
            .catch((error) => {
                console.error(
                    "[SW] Production service worker registration failed:",
                    error
                );
            });
    }, []);

    return null;
}