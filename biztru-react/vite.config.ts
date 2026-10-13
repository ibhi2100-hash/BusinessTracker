import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),

        VitePWA({
            /*
             * The service worker automatically checks for a newer
             * production build.
             */
            registerType: "autoUpdate",

            /*
             * We register the generated service worker ourselves.
             */
            injectRegister: false,

            manifest: {
                name: "BizTru",
                short_name: "BizTru",

                description:
                    "Financial control for growing businesses",

                /*
                 * IMPORTANT:
                 *
                 * Do not put the remembered route here.
                 *
                 * The application bootstrap is responsible for
                 * restoring the user's previous route.
                 */
                start_url: "/",
                scope: "/",

                display: "standalone",

                background_color: "#ffffff",
                theme_color: "#0F766E",

                icons: [
                    {
                        src: "/icons/icon-192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/icons/icon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },

            workbox: {
                /*
                 * Remove caches created by previous versions of
                 * the service worker.
                 */
                cleanupOutdatedCaches: true,

                /*
                 * Vite generates hashed assets such as:
                 *
                 * assets/index-B4J7K2.js
                 * assets/index-82KDJ3.css
                 *
                 * These are precached automatically.
                 *
                 * WASM is included because SQLite needs its runtime
                 * available before the application can initialize
                 * the local database.
                 */
                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,woff,woff2,wasm}",
                ],

                /*
                 * SPA fallback.
                 *
                 * Requests such as:
                 *
                 * /home
                 * /inventory
                 * /employees
                 * /products/123
                 *
                 * must resolve to index.html.
                 *
                 * React Router then decides which component to render.
                 */
                navigateFallback: "/index.html",

                /*
                 * Never treat API endpoints as SPA routes.
                 *
                 * Your backend synchronization endpoints must
                 * remain backend/network concerns.
                 */
                navigateFallbackDenylist: [
                    /^\/api\//,
                ],

                /*
                 * New service worker becomes active immediately.
                 */
                skipWaiting: true,

                /*
                 * Existing application tabs become controlled by
                 * the new service worker immediately.
                 */
                clientsClaim: true,

                /*
                 * Keep runtime caching intentionally limited.
                 *
                 * BizTru's business data belongs in local SQLite,
                 * not in the service-worker cache.
                 */
                runtimeCaching: [
                    {
                        urlPattern:
                            ({ request }) =>
                                request.destination ===
                                "image",

                        handler: "CacheFirst",

                        options: {
                            cacheName:
                                "biztru-images",

                            expiration: {
                                maxEntries: 100,

                                maxAgeSeconds:
                                    60 * 60 * 24 * 30,
                            },

                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },

            /*
             * Do not run the production service worker while
             * developing with Vite.
             */
            devOptions: {
                enabled: false,
            },
        }),
    ],

    server: {
        headers: {
            /*
             * Required for cross-origin isolation used by
             * SQLite WASM / SharedArrayBuffer configurations.
             */
            "Cross-Origin-Opener-Policy":
                "same-origin",

            "Cross-Origin-Embedder-Policy":
                "require-corp",
        },

        watch: {
            ignored: [
                "!**/packages/**",
            ],
        },
    },

    preview: {
        headers: {
            /*
             * Keep the same isolation requirements when testing
             * the production build with `vite preview`.
             */
            "Cross-Origin-Opener-Policy":
                "same-origin",

            "Cross-Origin-Embedder-Policy":
                "require-corp",
        },
    },
});