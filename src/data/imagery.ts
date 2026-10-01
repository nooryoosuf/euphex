// ─────────────────────────────────────────────
// Central imagery registry.
// All artwork lives in `public/images/` (sourced from the project's
// `Images/` folder). Pages and components consume these helpers —
// never hardcode `/images/...` paths in UI code.
// ─────────────────────────────────────────────

const img = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/${file}`;

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const dexImg = (p: string) => `${BASE}/${p}`;

export { DEX_META_AT } from "./dex.generated";
import { DEX_HEROES, ALL_HEROES } from "./dex.generated";
import { mlbbHeroImage } from "./mlbb";

/** Full 134-hero roster (portrait + icon + lanes + difficulty for everyone). */
export const ALL_HERO_SLUGS = Object.keys(ALL_HEROES);
export function allHero(slug: string) {
  const e = ALL_HEROES[slug];
  if (!e) return null;
  return {
    name: e.name,
    portrait: dexImg(e.portrait),
    icon: dexImg(e.icon),
    lanes: e.lanes,
    difficulty: e.difficulty,
    meta: e.meta,
  };
}

/** MLBBDex entry (portrait, icon, skin splashes, difficulty, live meta). */
export function dexHero(slug: string) {
  const e = DEX_HEROES[slug];
  if (!e) return null;
  return {
    ...e,
    portrait: dexImg(e.portrait),
    icon: dexImg(e.icon),
    splash: e.splash ? dexImg(e.splash) : null,
    skins: e.skins.map((s) => ({ ...s, img: dexImg(s.img) })),
  };
}

/** Normalize a hero display name to our slug (handles Yu Zhong, Luo-Yi…). */
export function heroKey(name: string): string {
  const k = name.toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, string> = { yuzhong: "yuzhong", luoyi: "luoyi", lapulapu: "lapulapu" };
  return map[k] ?? k;
}

export const IMAGES = {
  aamon: img("aamon_vessel_of_deceit_by_chisuniii_dmt905e.jpg"),
  angela: img("angela_strings_of_fate_by_chisuniii_dmtuxp5.jpg"),
  atlas: img("atlas_rune_sentinel_by_chisuniii_dmtxoxh.jpg"),
  aurora: img("aurora_mlbb_by_chisuniii_dmu2fry.jpg"),
  badang: img("badang_ironfists_new_by_chisuniii_dmv0ul4.jpg"),
  beatrix: img("beatrix_stellar_brilliance_by_chisuniii_dmvej59.jpg"),
  benedetta: img("benedetta_quantum_edge_by_chisuniii_dmvey7q.jpg"),
  kagura: img("kagura_mobile_legends_by_chisuniii_dfmbdeh.jpg"),
  lesley: img("lesley_hawk_eyed_sniper_mobile_legends_skin_by_k1ng011011_djeq7sy.jpg"),
  luoyi: img("luo_yi_oracle_of_sol_ml_mobile_legends_by_monxiomon_dg1cy7y.jpg"),
  badangZen: img("badang-fist-of-zen-mobile-legends-collector-revamped-4k-wallpaper-uhdpaper.com-58@5@k.jpg"),
  belerick: img("belerick-mlbb-sundering-fortress-starlight-skin-splash-art-4k-wallpaper-uhdpaper.com-444@5@q.jpg"),
  cecilion: img("cecilion-soul-vessels-mobile-legends-4k-wallpaper-uhdpaper.com-61@5@k.jpg"),
  hirara: img("hirara-mlbb-gilded-embers-basic-skin-splash-art-4k-wallpaper-uhdpaper.com-479@5@q.jpg"),
  layla: img("layla-the-beacon-mobile-legends-4k-wallpaper-uhdpaper.com-74@5@k.jpg"),
  lesleyAngelic: img("lesley-mlbb-angelic-agent-revamped-skin-splash-art-4k-wallpaper-uhdpaper.com-489@5@q.jpg"),
  lesleyFalcon: img("lesley-mlbb-falcon-mistress-collector-skin-splash-art-4k-wallpaper-uhdpaper.com-490@5@q.jpg"),
  xavier: img("xavier-sunborn-monarch-collector-skin-mobile-legends-4k-wallpaper-uhdpaper.com-619@5@i.jpg"),
  zetian: img("zetian-mlbb-elysian-luminance-starlight-skin-splash-art-4k-wallpaper-uhdpaper.com-527@5@q.jpg"),
  tigreal: img("tigreal-gold-baron-mlbb-skin-4k-wallpaper-3840x2160-uhdpaper.com-1031.0_b.jpg"),
  minotaur: img("minotaur-orbiter-skin-mobile-legends-uhdpaper.com-4K-13.jpg"),
  tigrealRevamped: img("tigreal-revamped-mobile-legends-project-next-uhdpaper.com-4K-5.2874.jpg"),
  yisunshin: img("yi-sun-shin-mlbb-lone-destructor-revamped-collector-skin-splash-art-4k-wallpaper-uhdpaper.com-523@5@q.jpg"),
  eudora: img("eudora-emerald-enchantress-mobile-legends-skin-uhdpaper.com-4K-8.1042.jpg"),
  retri: img("retri-icon.png"),
  alice: img("alice-mlbb-dreaming-monarch-collector-skin-splash-art-hd-wallpaper-uhdpaper.com-531@5@q.jpg"),
  granger: img("granger-cosmic-finality-mobile-legends-m7-prime-hd-wallpaper-uhdpaper.com-70@5@k.jpg"),
  hanzo: img("hanzo-mlbb-soul-fire-splash-art-hd-wallpaper-uhdpaper.com-472@5@q.jpg"),
  kimmy: img("kimmy-mlbb-starbound-sentry-splash-art-hd-wallpaper-uhdpaper.com-488@5@q.jpg"),
  ling: img("ling-serene-mlbb-plume-revamped-collector-skin-splash-art-hd-wallpaper-uhdpaper.com-492@5@q.jpg"),
  miya: img("miya-mlbb-arrow-of-spring-skin-splash-art-hd-wallpaper-uhdpaper.com-496@5@q.jpg"),
  selena: img("selena-mlbb-hannyas-vengeance-skin-splash-art-hd-wallpaper-uhdpaper.com-515@5@q.jpg"),
  sun: img("sun-queller-of-chaos-mobile-legends-hd-wallpaper-uhdpaper.com-735@5@i.jpg"),
  valir: img("valir-mlbb-demonlord-collector-skin-splash-art-hd-wallpaper-uhdpaper.com-518@5@q.jpg"),
} as const;

/** Homepage hero — layered parallax stack (back → front). */
export const HERO_STACK = [IMAGES.hirara, IMAGES.kagura, IMAGES.zetian] as const;

/** Section heading backgrounds — every page gets its own artwork, no repeats. */
export const SECTION_BG: Record<string, string> = {
  teams: IMAGES.badang,
  players: IMAGES.granger,
  matches: IMAGES.hanzo,
  tournaments: IMAGES.aurora,
  news: IMAGES.luoyi,
  media: IMAGES.lesley,
  about: IMAGES.aamon,
  community: IMAGES.kagura,
  roast: IMAGES.angela,
  "find-your-hero": IMAGES.alice,
  "rate-my-main": IMAGES.ling,
  "most-likely": IMAGES.selena,
};

/** Team page heading backgrounds. */
export const TEAM_BG: Record<string, string> = {
  euphex: IMAGES.beatrix,
  aurex: IMAGES.benedetta,
};

/** Squad card covers. */
export const TEAM_CARD_ART: Record<string, string> = {
  euphex: IMAGES.beatrix,
  aurex: IMAGES.xavier,
};

/** Homepage community teaser — four photo boxes. */
export const COMMUNITY_ART = [IMAGES.lesleyAngelic, IMAGES.cecilion, IMAGES.belerick, IMAGES.layla] as const;

/** News card covers, keyed by article slug. */
export const NEWS_ART: Record<string, string> = {
  "ooredoo-contender-recap": IMAGES.kimmy,
  "on-flash-series-recap": IMAGES.valir,
  "dmgc-2026-recap": IMAGES.badangZen,
};

/** MLBB hero name → artwork (where available). */
const HERO_ART: Record<string, string> = {
  beatrix: IMAGES.beatrix,
  lesley: IMAGES.lesley,
  kagura: IMAGES.kagura,
  luoyi: IMAGES.luoyi,
  aurora: IMAGES.aurora,
  aamon: IMAGES.aamon,
  angela: IMAGES.angela,
  atlas: IMAGES.atlas,
  badang: IMAGES.badang,
  benedetta: IMAGES.benedetta,
  layla: IMAGES.layla,
  belerick: IMAGES.belerick,
  cecilion: IMAGES.cecilion,
  xavier: IMAGES.xavier,
  hirara: IMAGES.hirara,
  zetian: IMAGES.zetian,
  minotaur: IMAGES.minotaur,
  tigreal: IMAGES.tigrealRevamped,
  eudora: IMAGES.eudora,
  ling: IMAGES.ling,
  miya: IMAGES.miya,
};

export function imageForHero(heroName: string): string | null {
  const key = heroKey(heroName);
  // registry artwork first, fan wallpaper second
  return mlbbHeroImage(key) ?? HERO_ART[key] ?? null;
}

/** Dex art is reserved for the roast section only (story cards + reveal). */
export function roastHeroArt(heroName: string): string | null {
  const key = heroKey(heroName);
  return dexHero(key)?.splash ?? dexHero(key)?.portrait ?? HERO_ART[key] ?? null;
}

/** Share-card art: crisp fan wallpaper first (1080px canvas), dex as backup. */
export function cardHeroArt(heroName: string): string | null {
  const key = heroKey(heroName);
  return HERO_ART[key] ?? dexHero(key)?.splash ?? dexHero(key)?.portrait ?? null;
}

/** All official skin splashes for a hero (default first). */
export function heroSkins(heroName: string): { name: string; img: string }[] {
  return dexHero(heroKey(heroName))?.skins ?? [];
}

/** Difficulty (1–10) + live meta snapshot for a hero. */
export function heroMeta(heroName: string): {
  difficulty: number | null;
  tier?: string;
  winRate?: number;
  pickRate?: number;
  banRate?: number;
} | null {
  const e = DEX_HEROES[heroKey(heroName)];
  if (!e) return null;
  return { difficulty: e.difficulty, ...e.meta };
}

/** Player heading backdrop — favorite hero art, else role-based art. */
export function imageForPlayer(favoriteHero: string, role: string): string {
  const direct = imageForHero(favoriteHero);
  if (direct) return direct;
  if (role === "Jungle") return IMAGES.aamon;
  if (role === "Mid Lane") return IMAGES.kagura;
  if (role === "Gold Lane") return IMAGES.lesley;
  if (role === "EXP Lane") return IMAGES.sun;
  return IMAGES.atlas;
}

/** Deterministic pick for tournaments / news (stable per slug) — fresh pool, no section repeats. */
const POOL = [IMAGES.alice, IMAGES.selena, IMAGES.kimmy, IMAGES.sun, IMAGES.valir, IMAGES.hanzo];
export function imageForSlug(slug: string): string {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 997;
  return POOL[h % POOL.length];
}
