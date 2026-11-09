
import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        // Development: remove stale workers.
        if (import.meta.env.DEV) {
            void navigator.serviceWorker
                .getRegistrations()
                .then(async (registrations) => {
                    await Promise.all(
                        registrations.map((registration) =>
                            registration.unregister()
                        )
                    );

                    console.info(
                        "[SW] Development registrations cleared"
                    );
                })
                .catch((error) => {
                    console.error(
                        "[SW] Development cleanup failed:",
                        error
                    );
                });

            return;
        }

        // Production: register the generated Workbox worker.
        const updateSW = registerSW({
            immediate: true,

            onNeedRefresh() {
                console.info(
                    "[SW] A new BizTru version is available."
                );

                window.dispatchEvent(
                    new CustomEvent("biztru:update-available")
                );
            },

            onOfflineReady() {
                console.info(
                    "[SW] BizTru assets are ready offline."
                );

                window.dispatchEvent(
                    new CustomEvent("biztru:offline-ready")
                );
            },

            onRegisteredSW(_url, registration) {
                console.info(
                    "[SW] Registered:",
                    registration?.scope
                );
            },

            onRegisterError(error) {
                console.error(
                    "[SW] Registration failed:",
                    error
                );
            },
        });

        return () => {
            // Do not unregister the worker here.
            // It must remain installed after React unmounts.
            void updateSW;
        };
    }, []);

    return null;
}
