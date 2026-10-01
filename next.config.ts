import type { NextConfig } from "next";

// Static export for custom-domain hosting (Cloudflare Pages → euphex.mv).
// Do NOT set NEXT_PUBLIC_BASE_PATH for root-domain deploys — it must stay
// empty so assets resolve at /_next/* and /images/*.
// Only set NEXT_PUBLIC_BASE_PATH=/euphex for GitHub project-site URLs
// (<user>.github.io/euphex/).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
  images: { unoptimized: true },
};

export default nextConfig;
