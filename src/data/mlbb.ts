// Centralized MLBB asset layer — single source of truth for hero artwork.
//
// Any component references a hero by ID only (e.g. hero="chou"); this module
// resolves the correct local artwork file. Artwork files live in
// public/assets/mlbb/ and are produced by scripts/fetch-mlbb-assets.mjs.
// Registry: src/data/mlbb/heroes.json (generated — do not edit by hand).
import registry from "./mlbb/heroes.json";

export interface MlbbSkin {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
  downloaded: boolean;
}

export interface MlbbHero {
  id: string;
  name: string;
  image: string;
  width: number;
  height: number;
  skins: MlbbSkin[];
}

type Registry = Record<string, MlbbHero>;

const DB = registry as Registry;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const withBase = (p: string) => (p ? `${BASE}/${p}` : p);

/** Normalize any hero spelling to its canonical registry id. */
export function mlbbId(input: string): string {
  const key = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases: Record<string, string> = { popolandkupa: "popol" };
  return aliases[key] ?? key;
}

/** Full hero record (or null when the hero has no ingested artwork yet). */
export function getMlbbHero(id: string): MlbbHero | null {
  return DB[mlbbId(id)] ?? null;
}

/** All ingested hero ids, sorted. */
export function mlbbHeroIds(): string[] {
  return Object.keys(DB).sort();
}

/**
 * Resolved artwork URL for a hero (optionally a specific skin id).
 * Returns null when unavailable so callers render a graceful fallback.
 */
export function mlbbHeroImage(id: string, skinId?: string): string | null {
  const hero = getMlbbHero(id);
  if (!hero) return null;
  if (skinId) {
    const skin = hero.skins.find((s) => s.id === skinId && s.downloaded && s.image);
    if (skin) return withBase(skin.image);
  }
  return hero.image ? withBase(hero.image) : null;
}

/** Downloaded skins for a hero (for selectors / galleries). */
export function mlbbHeroSkins(id: string): MlbbSkin[] {
  return (getMlbbHero(id)?.skins ?? []).filter((s) => s.downloaded && s.image);
}
