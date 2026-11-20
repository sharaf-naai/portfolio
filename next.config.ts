import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Set only by the GitHub Pages workflow (e.g. "/portfolio"): static export under a sub-path.
const base = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  // a stray package-lock.json in the home folder would otherwise be taken as the workspace root
  turbopack: { root: process.cwd() },
  ...(base && { output: "export", basePath: base, trailingSlash: true, images: { unoptimized: true } }),
};

export default createNextIntlPlugin()(nextConfig);
