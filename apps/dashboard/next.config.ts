import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  // add domains
  images: {
    domains: ["localhost"],
  },

  transpilePackages: [
    "@mono-repo-template/axios-client",
    "@mono-repo-template/utils",
  ],
  devIndicators: false,

  // Turbopack configuration for monorepo
  // Set root to the workspace root where Next.js package is located (pnpm hoists to workspace root)
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default withNextIntl(nextConfig);
