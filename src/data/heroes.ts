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
  minotaur: { lane: "Roam", hue: 150, label: "MI" },
  grock: { lane: "Roam", hue: 160, label: "GR" },
  rafaela: { lane: "Roam", hue: 300, label: "RA" },
  // Euphex pro pools
  clint: { lane: "Gold Lane", hue: 30, label: "CL" },
  miya: { lane: "Gold Lane", hue: 60, label: "MI" },
  hanabi: { lane: "Gold Lane", hue: 280, label: "HA" },
  obsidia: { lane: "Gold Lane", hue: 320, label: "OB" },
  odette: { lane: "Mid Lane", hue: 200, label: "OD" },
  vale: { lane: "Mid Lane", hue: 180, label: "VA" },
  zhuxin: { lane: "Mid Lane", hue: 290, label: "ZH" },
  vexana: { lane: "Mid Lane", hue: 270, label: "VE" },
  gord: { lane: "Mid Lane", hue: 210, label: "GO" },
  lunox: { lane: "Mid Lane", hue: 305, label: "LU" },
  zetian: { lane: "Mid Lane", hue: 240, label: "ZE" },
  cecilion: { lane: "Mid Lane", hue: 230, label: "CE" },
  xavier: { lane: "Mid Lane", hue: 250, label: "XA" },
  eudora: { lane: "Mid Lane", hue: 190, label: "EU" },
  kadita: { lane: "Mid Lane", hue: 175, label: "KA" },
  // roast pool expansion
  tigreal: { lane: "Roam", hue: 25, label: "TI" },
  belerick: { lane: "Roam", hue: 140, label: "BE" },
  benedetta: { lane: "EXP Lane", hue: 265, label: "BE" },
  granger: { lane: "Gold Lane", hue: 10, label: "GR" },
  harith: { lane: "Gold Lane", hue: 270, label: "HA" },
  karrie: { lane: "Gold Lane", hue: 180, label: "KA" },
  wanwan: { lane: "Gold Lane", hue: 45, label: "WA" },
  irithel: { lane: "Gold Lane", hue: 120, label: "IR" },
  roger: { lane: "Jungle", hue: 35, label: "RO" },
  popol: { lane: "Gold Lane", hue: 100, label: "PO" },
  martis: { lane: "EXP Lane", hue: 0, label: "MA" },
  thamuz: { lane: "EXP Lane", hue: 15, label: "TH" },
  aldous: { lane: "EXP Lane", hue: 50, label: "AL" },
  alucard: { lane: "EXP Lane", hue: 340, label: "AL" },
  zilong: { lane: "EXP Lane", hue: 110, label: "ZI" },
  sun: { lane: "EXP Lane", hue: 70, label: "SU" },
  ruby: { lane: "EXP Lane", hue: 330, label: "RU" },
  esmeralda: { lane: "EXP Lane", hue: 195, label: "ES" },
  hylos: { lane: "Roam", hue: 155, label: "HY" },
  akai: { lane: "Roam", hue: 85, label: "AK" },
  floryn: { lane: "Roam", hue: 320, label: "FL" },
};

export function makeHero(
  name: string,
  games: number,
  winRate: number,
  category: HeroEntry["category"],
  kda?: number,
  power?: number,
): HeroEntry {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const entry: HeroEntry = { hero: slug, games, winRate, category };
  if (kda !== undefined) entry.kda = kda;
  if (power !== undefined) entry.power = power;
  return entry;
}

export const HERO_LIST = Object.keys(HEROES).map(
  (slug) => slug.charAt(0).toUpperCase() + slug.slice(1),
);
