
import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      return;
    }

    registerSW({
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
          "[SW] A new application version is available."
        );
      },
    });
  }, []);

  return null;
}
