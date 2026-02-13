import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const isDev = process.env.NODE_ENV === "development"
const runtimeCaching = [
  {
    urlPattern: /^https?.*/,
    handler: "NetworkFirst",
    options: {
      cacheName: "api-cache",
      networkTimeoutSeconds: 5,
    },
  },
];

const withPWA = withPWAInit({
  dest: "public",
  disable: isDev,
  runtimeCaching,
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
