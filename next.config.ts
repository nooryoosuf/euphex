import type { NextConfig } from "next";

// Static export for GitHub Pages (no Node server).
// NEXT_PUBLIC_BASE_PATH=/euphex is set by the Pages workflow for project-site URLs.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
  images: { unoptimized: true },
};

export default nextConfig;
