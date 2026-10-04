import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),

        VitePWA({
            registerType: "autoUpdate",

            // We manually register the SW.
            injectRegister: false,

            manifest: {
                name: "BizTru",
                short_name: "BizTru",
                description: "Financial control for growing businesses",

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
                cleanupOutdatedCaches: true,

                globPatterns: [
                    "**/*.{js,css,html,ico,png,svg,woff2}",
                ],

                navigateFallback: "/index.html",
            },

            devOptions: {
                enabled: false,
            },
        }),
    ],

    server: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },

        watch: {
            ignored: [
                "!**/packages/**",
            ],
        },
    },

    preview: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
});