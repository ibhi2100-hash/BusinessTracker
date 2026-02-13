declare module "next-pwa" {
  import { NextConfig } from "next";

  interface PWAConfig {
    dest: string;
    runtimeCaching?: any[];
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: any[];
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
