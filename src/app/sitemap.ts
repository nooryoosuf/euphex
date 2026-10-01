import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { TEAMS } from "@/data/teams";
import { PLAYERS } from "@/data/players";
import { TOURNAMENTS } from "@/data/tournaments";
import { NEWS } from "@/data/content";
import { MATCHES } from "@/data/matches";

const BASE = siteConfig.org.url.replace(/\/$/, "");

const STATIC_ROUTES = [
  "/",
  "/about",
  "/community",
  "/find-your-hero",
  "/matches",
  "/media",
  "/most-likely",
  "/news",
  "/players",
  "/rate-my-main",
  "/recruit",
  "/retri-test",
  "/roast",
  "/scrim",
  "/teams",
  "/tournaments",
  "/whos-that-hero",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE}${route === "/" ? "/" : `${route}/`}`,
    lastModified: now,
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : route === "/teams" || route === "/players" ? 0.9 : 0.7,
  }));

  for (const t of TEAMS) {
    urls.push({
      url: `${BASE}/teams/${t.slug}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const p of PLAYERS) {
    urls.push({
      url: `${BASE}/players/${p.slug}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const t of TOURNAMENTS) {
    urls.push({
      url: `${BASE}/tournaments/${t.slug}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const n of NEWS) {
    urls.push({
      url: `${BASE}/news/${n.slug}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  for (const m of MATCHES) {
    urls.push({
      url: `${BASE}/matches/${m.id}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return urls;
}
