#!/usr/bin/env node
/**
 * Euphex MLBB asset pipeline — Splash repo → public/assets/mlbb + registry.
 *
 * Discovers hero/skin splash art dynamically from
 * https://github.com/Sparkies01/Splash (no hardcoded image URLs), downloads
 * the default splash per hero referenced in src/data/players.json, converts
 * to WebP, records dimensions, and writes src/data/mlbb/heroes.json —
 * the site's single source of truth for hero artwork.
 *
 * Artwork: community collection, MLBB IP © Moonton. Fan-project use;
 * credit Moonton. See README section in final report for details.
 *
 * Usage (from repo root):
 *   node scripts/fetch-mlbb-assets.mjs                  # all pool heroes, defaults only
 *   node scripts/fetch-mlbb-assets.mjs --with-skins      # also download every skin file
 *   node scripts/fetch-mlbb-assets.mjs --hero chou --hero ling
 *   node scripts/fetch-mlbb-assets.mjs --limit 3 --dry-run
 *   node scripts/fetch-mlbb-assets.mjs --migrate-pools  # rewrite players.json pools to hero IDs
 */
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PLAYERS_JSON = join(ROOT, "src", "data", "players.json");
const REGISTRY_PATH = join(ROOT, "src", "data", "mlbb", "heroes.json");
const ASSET_ROOT = join(ROOT, "public", "assets", "mlbb", "heroes");
const API = "https://api.github.com/repos/Sparkies01/Splash/contents";
const RAW = "https://raw.githubusercontent.com/Sparkies01/Splash/main";
const UA = { "User-Agent": "EuphexMLBBAssets/1.0 (+https://github.com/nooryoosuf/euphex; fan esports site asset pipeline)" };
if (process.env.GITHUB_TOKEN) UA.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.log("NOTE: sharp unavailable — saving original PNGs (larger files).");
}

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const HERO_ARGS = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--hero" && args[i + 1]) HERO_ARGS.push(args[i + 1].toLowerCase());
}
const LIMIT = Number((args[args.indexOf("--limit") + 1] ?? 0)) || 0;
const DRY = flag("--dry-run");
const WITH_SKINS = flag("--with-skins");
const MIGRATE = flag("--migrate-pools");

// Pinned defaults where the classic look is known; otherwise first file wins.
// Keys are our canonical hero slugs.
const DEFAULT_SKINS = {};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
// repo folder-normalized -> our canonical slug (only where they differ)
const SLUG_MAP = { popolandkupa: "popol" };
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-") || "untitled";

async function apiJson(path) {
  for (let a = 0; ; a++) {
    const r = await fetch(`${API}${path}`, { headers: UA });
    if (r.ok) return r.json();
    // GitHub rate limit: sleep until reset instead of hammering
    if (r.status === 403 && r.headers.get("x-ratelimit-remaining") === "0") {
      const reset = Number(r.headers.get("x-ratelimit-reset") || 0) * 1000;
      const wait = Math.max(reset - Date.now() + 5000, 10000);
      console.log(`  rate limit hit — sleeping ${(wait / 60000).toFixed(1)} min until reset…`);
      await sleep(wait);
      continue;
    }
    if ((r.status === 403 || r.status === 429) && a < 6) {
      const wait = 10000 * (a + 1);
      console.log(`  rate-limited, waiting ${wait / 1000}s…`);
      await sleep(wait);
      continue;
    }
    throw new Error(`GitHub API ${r.status} for ${path}`);
  }
}

async function download(url, referer) {
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(url, { headers: { ...UA, Referer: referer } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 50_000) throw new Error(`suspiciously small (${buf.length}b)`);
      return buf;
    } catch (e) {
      if (a === 3) throw e;
      await sleep(2000 * (a + 1));
    }
  }
}

function poolHeroSlugs() {
  const players = JSON.parse(readFileSync(PLAYERS_JSON, "utf8"));
  const set = new Set();
  for (const p of players) for (const h of p.heroPool ?? []) {
    const slug = (h.hero ?? h.slug ?? "").toLowerCase();
    if (slug) set.add(slug);
  }
  return [...set].sort();
}

async function main() {
  mkdirSync(join(ROOT, "src", "data", "mlbb"), { recursive: true });
  mkdirSync(ASSET_ROOT, { recursive: true });

  // 4. optional pool migration (local only — no network needed)
  if (MIGRATE && !DRY) {
    migratePools();
    // migrate-only run: skip the fetch phase entirely
    if (!HERO_ARGS.length && !WITH_SKINS && !LIMIT && !args.includes("--force")) return;
  }

  // 1. repo root → folder map (dynamic discovery, no hardcoded URLs)
  console.log("Listing Splash repo…");
  const root = await apiJson("");
  const folders = root.filter((e) => e.type === "dir").map((e) => e.name);
  const folderByNorm = new Map(folders.map((f) => [norm(f), f]));
  console.log(`  ${folders.length} hero folders upstream`);

  // 2. decide target heroes: pool slugs, or upstream folders matching --hero
  const normSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let wanted = poolHeroSlugs();
  if (HERO_ARGS.length) {
    const upstreamSlugs = [...folderByNorm.keys()];
    const picked = new Set();
    for (const q of HERO_ARGS) {
      const nq = normSlug(q);
      for (const u of upstreamSlugs) {
        if (u === nq || u.includes(nq) || nq.includes(u)) picked.add(u);
      }
      // also keep pool slugs matching the query
      for (const s of wanted) {
        const ns = normSlug(s);
        if (ns === nq || ns.includes(nq) || nq.includes(ns)) picked.add(s);
      }
    }
    // map upstream-normalized slugs back to our canonical form
    const rev = new Map([...folderByNorm.keys()].map((u) => [u, SLUG_MAP[u] ?? u]));
    wanted = [...picked].map((u) => rev.get(u) ?? u);
    const missing = HERO_ARGS.filter((q) => ![...picked].some((p) => p.includes(normSlug(q)) || normSlug(q).includes(p)));
    if (missing.length) console.log(`  WARN: no match for --hero: ${missing.join(", ")}`);
  }
  if (LIMIT) wanted = wanted.slice(0, LIMIT);
  console.log(`Target heroes (${wanted.length}): ${wanted.join(", ")}`);
  if (DRY) console.log("DRY RUN — no downloads, no writes.");

  // 3. per hero: list skins, pick default, download, convert, record
  // incremental: existing registry entries are kept, completed heroes skipped
  const FORCE = args.includes("--force");
  let registry = {};
  try {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  } catch { /* first run */ }
  const saveRegistry = () => writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
  let bytes = 0;
  for (const slug of wanted) {
    const have = registry[slug];
    if (have && have.image && have.width && !FORCE && !WITH_SKINS) {
      console.log(`  skip ${slug} (already in registry)`);
      continue;
    }
    const folder = folderByNorm.get(slug) ?? folderByNorm.get(Object.keys(SLUG_MAP).find((k) => SLUG_MAP[k] === slug) ?? "");
    if (!folder) {
      console.log(`  SKIP ${slug}: no folder upstream`);
      continue;
    }
    await sleep(1000);
    let files;
    try {
      files = (await apiJson(`/${encodeURIComponent(folder)}`)).filter((e) => e.type === "file" && /\.png$/i.test(e.name));
    } catch (e) {
      console.log(`  SKIP ${slug}: ${e.message}`);
      continue;
    }
    if (!files.length) {
      console.log(`  SKIP ${slug}: empty folder`);
      continue;
    }
    files.sort((a, b) => a.name.localeCompare(b.name));
    const pinned = DEFAULT_SKINS[slug];
    const def = (pinned && files.find((f) => norm(f.name.replace(/\.png$/i, "")) === norm(pinned))) || files[0];
    const heroDir = join(ASSET_ROOT, slug);
    const rel = (f) => `heroes/${slug}/${f}`;

    const entry = {
      id: slug,
      name: folder,
      image: "", width: 0, height: 0,
      skins: files.map((f) => {
        const base = f.name.replace(/\.png$/i, "");
        return { id: slugify(base), name: base, image: "", width: 0, height: 0, downloaded: false };
      }),
    };

    const jobs = [{ file: def, out: "default.webp", record: entry, isDefault: true }];
    if (WITH_SKINS) {
      for (const f of files) {
        if (f.name === def.name) continue;
        const base = f.name.replace(/\.png$/i, "");
        const rec = entry.skins.find((s) => s.id === slugify(base));
        jobs.push({ file: f, out: `${slugify(base)}.webp`, record: rec, isDefault: false });
      }
    }

    for (const job of jobs) {
      const rawUrl = `${RAW}/${encodeURIComponent(folder)}/${encodeURIComponent(job.file.name)}`;
      if (DRY) {
        console.log(`  [dry] ${slug}: ${job.out} ← ${rawUrl}`);
        continue;
      }
      const dest = join(heroDir, job.out.split("/").pop());
      mkdirSync(heroDir, { recursive: true });
      // fast path: file already on disk (previous run) — just read dims
      if (!FORCE && existsSync(dest)) {
        try {
          if (sharp) {
            const meta = await sharp(dest).metadata();
            const relPath = `assets/mlbb/${rel(job.out)}`;
            if (job.isDefault) {
              entry.image = relPath; entry.width = meta.width ?? 0; entry.height = meta.height ?? 0;
            } else if (job.record) {
              job.record.image = relPath; job.record.width = meta.width ?? 0; job.record.height = meta.height ?? 0; job.record.downloaded = true;
            }
            console.log(`  keep ${slug}/${job.out} ${meta.width}x${meta.height} (cached)`);
            continue;
          }
        } catch { /* fall through to download */ }
      }
      try {
        await sleep(1000);
        const buf = await download(rawUrl, `https://github.com/Sparkies01/Splash/tree/main/${encodeURIComponent(folder)}`);
        let out = buf, w = 0, h = 0;
        if (sharp) {
          const meta = await sharp(buf).metadata();
          w = meta.width ?? 0; h = meta.height ?? 0;
          out = await sharp(buf).webp({ quality: 82 }).toBuffer();
        } else {
          job.out = job.out.replace(/\.webp$/, ".png");
        }
        writeFileSync(dest, out);
        const relPath = `assets/mlbb/${rel(job.out)}`;
        if (job.isDefault) {
          entry.image = relPath; entry.width = w; entry.height = h;
        } else if (job.record) {
          job.record.image = relPath; job.record.width = w; job.record.height = h; job.record.downloaded = true;
        }
        bytes += out.length;
        console.log(`  got ${slug}/${job.out} ${w}x${h} ${(out.length / 1024).toFixed(0)}KB`);
      } catch (e) {
        console.log(`  FAIL ${slug}/${job.out}: ${e.message}`);
      }
    }
    // skins metadata always recorded (files only with --with-skins)
    for (const f of files) {
      const base = f.name.replace(/\.png$/i, "");
      const rec = entry.skins.find((s) => s.id === slugify(base));
      if (rec && !rec.image) rec.image = `assets/mlbb/skins/${slug}/${slugify(base)}.webp`;
    }
    registry[slug] = entry;
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
  }

  if (!DRY) {
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
    console.log(`Registry: ${REGISTRY_PATH} (${Object.keys(registry).length} heroes, ${(bytes / 1048576).toFixed(1)} MB new)`);
  }
  console.log("Done.");
}

function migratePools() {
  const players = JSON.parse(readFileSync(PLAYERS_JSON, "utf8"));
  for (const p of players) {
    p.heroPool = (p.heroPool ?? []).map((h) => {
      const hero = (h.hero ?? h.slug ?? "").toLowerCase();
      const next = { hero, games: h.games, winRate: h.winRate, category: h.category };
      if (h.kda !== undefined) next.kda = h.kda;
      if (h.power !== undefined) next.power = h.power;
      return next;
    });
  }
  writeFileSync(PLAYERS_JSON, JSON.stringify(players, null, 2) + "\n");
  console.log("players.json pools migrated to hero IDs (review with git diff).");
}

await main();
