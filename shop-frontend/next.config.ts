import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isDev = process.env.NODE_ENV === "development";
 
const runtimeCaching = [
  {
    urlPattern: ({ request }: any) =>
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "worker",

    handler: "CacheFirst",

    options: {
      cacheName: "app-shell",

      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },

      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },

  {
    urlPattern: /\/_next\/static\//,

    handler: "CacheFirst",

    options: {
      cacheName: "next-static-assets",

      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  },

  {
    urlPattern: ({ request }: any) =>
      request.destination === "image",

    handler: "CacheFirst",

    options: {
      cacheName: "images",

      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 90,
      },
    },
  },

  {
    urlPattern: ({ url }: any) =>
      url.pathname.startsWith("/api"),

    handler: "CacheFirst",

    options: {
      cacheName: "api-cache",

      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 5,
      },

      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },

  {
    urlPattern: ({ request }: any) =>
      request.mode === "navigate",

    handler: "CacheFirst",

    options: {
      cacheName: "pages",

      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      },

      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },

  {
    urlPattern: /^https:.*$/,

    handler: "CacheFirst",

    options: {
      cacheName: "https-calls",

      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  },
];

const withPWA = withPWAInit({
  dest: "public",

  disable: isDev,

  register: true,

  skipWaiting: true,

  runtimeCaching,

  buildExcludes: [/manifest\.json$/],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  transpilePackages: ["@business/shared"],

  experimental: {
    optimizePackageImports: ["dexie"],
  },
};

export default withPWA(nextConfig);