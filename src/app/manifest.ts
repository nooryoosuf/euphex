import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.org.fullName,
    short_name: siteConfig.org.name,
    description: siteConfig.org.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07090D",
    theme_color: "#07090D",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}

export const dynamic = "force-static";
