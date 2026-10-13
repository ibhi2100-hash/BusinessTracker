import { useEffect } from "react";

import { registerSW } 

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (import.meta.env.DEV) {
            return;
        }

        const updateSW = registerSW({
            immediate: true,

            onRegistered(registration) {
                console.log(
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

            onOfflineReady() {
                console.log(
                    "[SW] Offline application ready."
                );
            },

            onNeedRefresh() {
                console.log(
                    "[SW] New application version available."
                );
            },
        });

        void updateSW;
    }, []);

    return null;
}
