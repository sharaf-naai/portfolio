import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a stray package-lock.json in the home folder would otherwise be taken as the workspace root
  turbopack: { root: process.cwd() },
};

export default nextConfig;
