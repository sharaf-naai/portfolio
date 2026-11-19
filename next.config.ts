import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // a stray package-lock.json in the home folder would otherwise be taken as the workspace root
  turbopack: { root: process.cwd() },
};

export default createNextIntlPlugin()(nextConfig);
