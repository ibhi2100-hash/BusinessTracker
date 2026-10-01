import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  transpilePackages: [
    "@business/shared",
  ],

  experimental: {
    optimizePackageImports: ["dexie"],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      console.log(
        "[WEBPACK] SQLite-related rules:",
        config.module.rules.filter(
          (rule: any) =>
            rule?.test?.toString?.().includes("js") ||
            rule?.test?.toString?.().includes("worker")
        )
      );
    }

    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },

      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },

      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;