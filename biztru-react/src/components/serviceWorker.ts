import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        // Never allow the production SW to interfere with Vite development.
        if (import.meta.env.DEV) {
            void navigator.serviceWorker
                .getRegistrations()
                .then(async (registrations) => {
                    for (const registration of registrations) {
                        await registration.unregister();
                    }

                    // Also remove old development caches.
                    const cacheNames = await caches.keys();

                    await Promise.all(
                        cacheNames
                            .filter((name) =>
                                name.startsWith("biztru-")
                            )
                            .map((name) => caches.delete(name))
                    );
                })
                .catch((error) => {
                    console.error(
                        "[SW] Failed to clean development service worker:",
                        error
                    );
                });

            return;
        }

        void navigator.serviceWorker
            .register("/sw.js", {
                scope: "/",
                updateViaCache: "none",
            })
            .then(async (registration) => {
                console.log(
                    "[SW] Production service worker registered:",
                    registration.scope
                );

                // Ask the browser to check for a newer SW.
                await registration.update();
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
