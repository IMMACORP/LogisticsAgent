import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@inquiry-agent/shared-types"],
};

export default nextConfig;
