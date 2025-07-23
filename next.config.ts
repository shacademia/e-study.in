import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Dangerously allow production builds to successfully complete
    // even if your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skips ESLint checks
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
