import type { HeroEntry } from "./types";

// Central MLBB hero registry. Artwork is generated locally from `hue`
// so the site needs no external image URLs. Replace `art` with a CDN
// path later — components consume `heroArt(hero)` only.
export const HEROES: Record<string, { lane: HeroEntry["lane"]; hue: number; label: string }> = {
  fanny: { lane: "Jungle", hue: 222, label: "FA" },
  ling: { lane: "Jungle", hue: 190, label: "LI" },
  hayabusa: { lane: "Jungle", hue: 260, label: "HA" },
  joy: { lane: "Jungle", hue: 320, label: "JO" },
  natalia: { lane: "Roam", hue: 350, label: "NA" },
  lancelot: { lane: "Jungle", hue: 210, label: "LA" },
  gusion: { lane: "Mid Lane", hue: 250, label: "GU" },
  valentina: { lane: "Mid Lane", hue: 275, label: "VA" },
  pharsa: { lane: "Mid Lane", hue: 200, label: "PH" },
  yve: { lane: "Mid Lane", hue: 230, label: "YV" },
  estes: { lane: "Roam", hue: 150, label: "ES" },
  franco: { lane: "Roam", hue: 25, label: "FR" },
  chou: { lane: "Roam", hue: 45, label: "CH" },
  khufra: { lane: "Roam", hue: 170, label: "KH" },
  mathilda: { lane: "Roam", hue: 300, label: "MA" },
  beatrix: { lane: "Gold Lane", hue: 15, label: "BE" },
  claude: { lane: "Gold Lane", hue: 40, label: "CL" },
  brody: { lane: "Gold Lane", hue: 5, label: "BR" },
  melissa: { lane: "Gold Lane", hue: 90, label: "ME" },
  layla: { lane: "Gold Lane", hue: 55, label: "LA" },
  yuzhong: { lane: "EXP Lane", hue: 0, label: "YU" },
  terizla: { lane: "EXP Lane", hue: 20, label: "TE" },
  lapulapu: { lane: "EXP Lane", hue: 140, label: "LP" },
  paquito: { lane: "EXP Lane", hue: 60, label: "PA" },
  johnson: { lane: "Roam", hue: 205, label: "JO" },
  nana: { lane: "Mid Lane", hue: 310, label: "NA" },
};

export function makeHero(
  name: string,
  games: number,
  winRate: number,
  category: HeroEntry["category"],
  kda?: number,
): HeroEntry {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const reg = HEROES[slug] ?? { lane: "Multi" as const, hue: 220, label: name.slice(0, 2).toUpperCase() };
  return { name, slug, lane: reg.lane, art: { hue: reg.hue, label: reg.label }, games, winRate, kda, category };
}

export const HERO_LIST = Object.keys(HEROES).map(
  (slug) => slug.charAt(0).toUpperCase() + slug.slice(1),
);
