// ─────────────────────────────────────────────
// Central imagery registry.
// All artwork lives in `public/images/` (sourced from the project's
// `Images/` folder). Pages and components consume these helpers —
// never hardcode `/images/...` paths in UI code.
// ─────────────────────────────────────────────

const img = (file: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/${file}`;

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
} as const;

/** Homepage hero — layered parallax stack (back → front). */
export const HERO_STACK = [IMAGES.beatrix, IMAGES.kagura, IMAGES.lesley] as const;

/** Section heading backgrounds, one per page. */
export const SECTION_BG: Record<string, string> = {
  teams: IMAGES.badang,
  players: IMAGES.benedetta,
  matches: IMAGES.atlas,
  tournaments: IMAGES.aurora,
  news: IMAGES.luoyi,
  media: IMAGES.lesley,
  about: IMAGES.aamon,
  community: IMAGES.kagura,
  roast: IMAGES.angela,
  "find-your-hero": IMAGES.aurora,
  "rate-my-main": IMAGES.beatrix,
  "most-likely": IMAGES.benedetta,
};

/** Team page heading backgrounds. */
export const TEAM_BG: Record<string, string> = {
  main: IMAGES.beatrix,
  academy: IMAGES.benedetta,
  rising: IMAGES.badang,
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
};

export function imageForHero(heroName: string): string | null {
  const key = heroName.toLowerCase().replace(/[^a-z]/g, "");
  return HERO_ART[key] ?? null;
}

/** Player heading backdrop — favorite hero art, else role-based art. */
export function imageForPlayer(favoriteHero: string, role: string): string {
  const direct = imageForHero(favoriteHero);
  if (direct) return direct;
  if (role === "Jungle") return IMAGES.aamon;
  if (role === "Mid Lane") return IMAGES.kagura;
  if (role === "Gold Lane") return IMAGES.lesley;
  if (role === "EXP Lane") return IMAGES.badang;
  return IMAGES.atlas;
}

/** Deterministic pick for tournaments / news (stable per slug). */
const POOL = [IMAGES.aurora, IMAGES.luoyi, IMAGES.kagura, IMAGES.atlas, IMAGES.beatrix, IMAGES.lesley];
export function imageForSlug(slug: string): string {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 997;
  return POOL[h % POOL.length];
}
