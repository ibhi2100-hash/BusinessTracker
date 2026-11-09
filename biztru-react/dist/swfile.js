
/* ============================================================
 * BizTru Production Service Worker
 *
 * Responsibilities:
 *
 * 1. Cache the application shell.
 * 2. Cache SQLite WASM runtime files.
 * 3. Cache required static assets.
 * 4. Provide SPA navigation fallback.
 * 5. Keep runtime caching controlled.
 * 6. Never cache API/business data blindly.
 * 7. Never treat the SW cache as the application's database.
 * ============================================================ */

const SW_VERSION = "v1";

const CACHE_PREFIX = "biztru";

const APP_CACHE = `${CACHE_PREFIX}-app-${SW_VERSION}`;
const SQLITE_CACHE = `${CACHE_PREFIX}-sqlite-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}-static-${SW_VERSION}`;

/*
 * ------------------------------------------------------------
 * Application shell
 * ------------------------------------------------------------
 *
 * These are files required to construct the application itself.
 *
 * Vite-generated JS/CSS files are normally discovered from
 * index.html during installation rather than hard-coded here.
 */
const APP_SHELL = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
];

/*
 * ------------------------------------------------------------
 * SQLite WASM files
 * ------------------------------------------------------------
 *
 * IMPORTANT:
 *
 * Change these paths to exactly match the files emitted by
 * your SQLite WASM build.
 *
 * Examples:
 *
 * /sqlite3.wasm
 * /sqlite3.js
 * /sqlite3-opfs-async-proxy.js
 * /sqlite.worker.js
 *
 * Only include files that actually exist in production.
 */
const SQLITE_ASSETS = [
    "/sqlite3.wasm",
];

/*
 * ------------------------------------------------------------
 * Static assets
 * ------------------------------------------------------------
 *
 * Only put truly stable/static files here.
 */
const STATIC_ASSETS = [
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

/*
 * ------------------------------------------------------------
 * Installation
 * ------------------------------------------------------------
 */

self.addEventListener("install", (event) => {
    console.log("[SW] Installing:", SW_VERSION);

    event.waitUntil(
        Promise.all([
            cacheAppShell(),
            cacheSQLiteRuntime(),
            cacheStaticAssets(),
        ])
            .then(() => {
                /*
                 * Activate the new SW immediately.
                 *
                 * This is useful for a business application where
                 * you want the newly installed version to become
                 * available without waiting for all old tabs to close.
                 */
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error(
                    "[SW] Installation failed:",
                    error
                );

                throw error;
            })
    );
});

/*
 * ------------------------------------------------------------
 * Activate
 * ------------------------------------------------------------
 */

self.addEventListener("activate", (event) => {
    console.log("[SW] Activating:", SW_VERSION);

    event.waitUntil(
        cleanupOldCaches()
            .then(() => self.clients.claim())
    );
});

/*
 * ------------------------------------------------------------
 * Fetch
 * ------------------------------------------------------------
 */

self.addEventListener("fetch", (event) => {
    const request = event.request;

    /*
     * Only handle GET requests.
     *
     * POST/PUT/PATCH/DELETE requests should never be handled
     * by this generic cache layer.
     */
    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    /*
     * Do not interfere with cross-origin resources.
     *
     * This keeps the service worker scoped to BizTru's own
     * application assets.
     */
    if (url.origin !== self.location.origin) {
        return;
    }

    /*
     * Navigation requests:
     *
     * /inventory
     * /employees
     * /settings
     * /products/123
     *
     * are all SPA routes.
     */
    if (request.mode === "navigate") {
        event.respondWith(
            handleNavigationRequest(request)
        );

        return;
    }

    /*
     * SQLite runtime files should be cache-first.
     */
    if (isSQLiteAsset(url)) {
        event.respondWith(
            cacheFirst(
                request,
                SQLITE_CACHE
            )
        );

        return;
    }

    /*
     * Static JS/CSS/fonts/images are generally safe to
     * cache-first after deployment.
     */
    if (isStaticAsset(url)) {
        event.respondWith(
            cacheFirst(
                request,
                STATIC_CACHE
            )
        );

        return;
    }

    /*
     * Application shell resources.
     */
    if (isAppShellAsset(url)) {
        event.respondWith(
            cacheFirst(
                request,
                APP_CACHE
            )
        );

        return;
    }

    /*
     * Everything else:
     *
     * Let the browser handle it normally.
     *
     * This is intentional.
     *
     * We do NOT blindly cache API responses or arbitrary
     * business data.
     */
});

/*
 * ============================================================
 * INSTALL HELPERS
 * ============================================================
 */

async function cacheAppShell() {
    const cache = await caches.open(APP_CACHE);

    /*
     * Cache the explicitly known shell files first.
     */
    for (const path of APP_SHELL) {
        try {
            await cache.add(
                new Request(path, {
                    cache: "reload",
                })
            );

            console.log(
                "[SW] Cached app shell:",
                path
            );
        } catch (error) {
            /*
             * Don't make the entire SW installation fail because
             * one optional shell file is missing.
             */
            console.warn(
                "[SW] Could not cache app shell asset:",
                path,
                error
            );
        }
    }

    /*
     * Discover Vite's generated JS/CSS assets from index.html.
     *
     * This means you don't have to manually update this list
     * every time Vite generates:
     *
     * assets/index-ABC123.js
     * assets/index-XYZ789.css
     */
    try {
        const response = await fetch(
            "/index.html",
            {
                cache: "reload",
            }
        );

        if (!response.ok) {
            return;
        }

        const html = await response.text();

        const assetUrls = extractStaticAssets(
            html
        );

        await Promise.all(
            assetUrls.map(async (assetUrl) => {
                try {
                    await cache.add(
                        new Request(
                            assetUrl,
                            {
                                cache: "reload",
                            }
                        )
                    );

                    console.log(
                        "[SW] Cached application asset:",
                        assetUrl
                    );
                } catch (error) {
                    console.warn(
                        "[SW] Failed to cache application asset:",
                        assetUrl,
                        error
                    );
                }
            })
        );
    } catch (error) {
        console.warn(
            "[SW] Failed to discover application assets:",
            error
        );
    }
}

async function cacheSQLiteRuntime() {
    if (SQLITE_ASSETS.length === 0) {
        return;
    }

    const cache = await caches.open(
        SQLITE_CACHE
    );

    await Promise.all(
        SQLITE_ASSETS.map(async (path) => {
            try {
                await cache.add(
                    new Request(path, {
                        cache: "reload",
                    })
                );

                console.log(
                    "[SW] Cached SQLite runtime:",
                    path
                );
            } catch (error) {
                console.error(
                    "[SW] Failed to cache SQLite runtime:",
                    path,
                    error
                );
            }
        })
    );
}

async function cacheStaticAssets() {
    if (STATIC_ASSETS.length === 0) {
        return;
    }

    const cache = await caches.open(
        STATIC_CACHE
    );

    await Promise.all(
        STATIC_ASSETS.map(async (path) => {
            try {
                await cache.add(
                    new Request(path, {
                        cache: "reload",
                    })
                );

                console.log(
                    "[SW] Cached static asset:",
                    path
                );
            } catch (error) {
                console.warn(
                    "[SW] Failed to cache static asset:",
                    path,
                    error
                );
            }
        })
    );
}

/*
 * ============================================================
 * NAVIGATION
 * ============================================================
 */

async function handleNavigationRequest(request) {
    try {
        /*
         * Always try the network first for navigation.
         *
         * This lets the browser obtain the newest index.html
         * and therefore the newest Vite asset references.
         */
        const response = await fetch(
            request
        );

        if (response.ok) {
            const cache = await caches.open(
                APP_CACHE
            );

            await cache.put(
                "/index.html",
                response.clone()
            );

            return response;
        }

        throw new Error(
            `Navigation request failed: ${response.status}`
        );
    } catch (error) {
        console.warn(
            "[SW] Navigation network request failed. Using cached app shell.",
            error
        );

        /*
         * Offline fallback.
         *
         * React Router can then interpret the current URL and
         * render the correct page.
         */
        const cachedIndex = await caches.match(
            "/index.html"
        );

        if (cachedIndex) {
            return cachedIndex;
        }

        return new Response(
            "BizTru is currently unavailable offline.",
            {
                status: 503,
                headers: {
                    "Content-Type": "text/plain",
                },
            }
        );
    }
}

/*
 * ============================================================
 * CACHE STRATEGIES
 * ============================================================
 */

async function cacheFirst(
    request,
    cacheName
) {
    const cache = await caches.open(
        cacheName
    );

    const cached = await cache.match(
        request
    );

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(
            request
        );

        if (
            response.ok &&
            response.type === "basic"
        ) {
            await cache.put(
                request,
                response.clone()
            );
        }

        return response;
    } catch (error) {
        console.error(
            "[SW] Cache-first request failed:",
            request.url,
            error
        );

        throw error;
    }
}

/*
 * ============================================================
 * CACHE CLEANUP
 * ============================================================
 */

async function cleanupOldCaches() {
    const currentCaches = new Set([
        APP_CACHE,
        SQLITE_CACHE,
        STATIC_CACHE,
    ]);

    const cacheNames = await caches.keys();

    await Promise.all(
        cacheNames.map(async (cacheName) => {
            if (
                cacheName.startsWith(
                    `${CACHE_PREFIX}-`
                ) &&
                !currentCaches.has(cacheName)
            ) {
                console.log(
                    "[SW] Removing old cache:",
                    cacheName
                );

                await caches.delete(
                    cacheName
                );
            }
        })
    );
}

/*
 * ============================================================
 * ASSET DETECTION
 * ============================================================
 */

function isSQLiteAsset(url) {
    return (
        SQLITE_ASSETS.includes(
            url.pathname
        ) ||
        url.pathname.endsWith(
            ".wasm"
        )
    );
}

function isStaticAsset(url) {
    const path = url.pathname;

    return (
        path.startsWith("/assets/") ||
        path.startsWith("/icons/") ||
        path.startsWith("/fonts/") ||
        path.endsWith(".css") ||
        path.endsWith(".js") ||
        path.endsWith(".woff") ||
        path.endsWith(".woff2") ||
        path.endsWith(".ttf") ||
        path.endsWith(".svg") ||
        path.endsWith(".png") ||
        path.endsWith(".jpg") ||
        path.endsWith(".jpeg") ||
        path.endsWith(".webp")
    );
}

function isAppShellAsset(url) {
    return (
        url.pathname === "/" ||
        url.pathname === "/index.html" ||
        url.pathname === "/manifest.webmanifest"
    );
}

/*
 * ============================================================
 * VITE ASSET DISCOVERY
 * ============================================================
 */

function extractStaticAssets(html) {
    const assets = new Set();

    /*
     * <script type="module" src="/assets/index.js">
     */
    const scriptRegex =
        /<script[^>]+src=["']([^"']+)["']/gi;

    let match;

    while (
        (match = scriptRegex.exec(html)) !== null
    ) {
        assets.add(
            normalizeAssetPath(match[1])
        );
    }

    /*
     * <link rel="stylesheet" href="/assets/index.css">
     */
    const stylesheetRegex =
        /<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi;

    while (
        (match = stylesheetRegex.exec(html)) !== null
    ) {
        assets.add(
            normalizeAssetPath(match[1])
        );
    }

    return Array.from(
        assets
    ).filter(Boolean);
}

function normalizeAssetPath(
    value
) {
    try {
        const url = new URL(
            value,
            self.location.origin
        );

        if (
            url.origin !==
            self.location.origin
        ) {
            return null;
        }

        return (
            url.pathname +
            url.search
        );
    } catch {
        return null;
    }
}