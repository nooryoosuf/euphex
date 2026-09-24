// ─────────────────────────────────────────────
// EUPHEX — central brand + theme configuration.
// Change names, accent, and links here; UI consumes this file.
// ─────────────────────────────────────────────

export const siteConfig = {
  org: {
    name: "EUPHEX",
    fullName: "EUPHEX ESPORTS",
    tagline: "PLAY HARD. PLAY TOGETHER.",
    game: "MOBILE LEGENDS: BANG BANG",
    shortGame: "MLBB",
    founded: 2023,
    description:
      "Euphex is a competitive Mobile Legends: Bang Bang esports organization fielding two squads under one standard — Euphex and Aurex.",
    url: "https://euphex.gg",
  },
  theme: {
    /** Single recognizable organization accent. Change once, everywhere updates. */
    accent: "#E3256B",
    accentSoft: "rgba(227,37,107,0.12)",
    accentStrong: "#B01150",
    background: "#07090D",
    surface: "#0C0F16",
    surface2: "#11141D",
    line: "rgba(255,255,255,0.08)",
    text: "#F2F4F8",
    muted: "#9AA3B2",
  },
  socials: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    youtube: "https://youtube.com",
    discord: "https://discord.com",
  },
  nav: {
    compete: [
      { label: "Teams", href: "/teams" },
      { label: "Players", href: "/players" },
      { label: "Matches", href: "/matches" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "Media", href: "/media" },
      { label: "News", href: "/news" },
    ],
    community: [
      { label: "Roast the Roster", href: "/roast" },
      { label: "Find Your Hero", href: "/find-your-hero" },
      { label: "Rate My Main", href: "/rate-my-main" },
      { label: "Most Likely To", href: "/most-likely" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
