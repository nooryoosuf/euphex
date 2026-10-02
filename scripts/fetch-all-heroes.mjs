#!/usr/bin/env node
/**
 * Euphex full-roster ingest — every upstream hero gets a registry entry.
 *
 * Extends src/data/mlbb/heroes.json to ALL heroes in the Splash repo
 * (https://github.com/Sparkies01/Splash) using REMOTE splash URLs —
 * no downloads, no repo bloat. Existing local entries (downloaded WebPs)
 * are preserved untouched; only missing heroes/skins are added.
 *
 * After this runs, the admin hero picker resolves every real hero, so the
 * "artwork fetched later" fallback only triggers for genuinely unknown names.
 *
 * Usage (CI or local with node 18+):
 *   node scripts/fetch-all-heroes.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY_PATH = join(ROOT, "src", "data", "mlbb", "heroes.json");
const TREE_API = "https://api.github.com/repos/Sparkies01/Splash/git/trees/main?recursive=1";
const RAW = "https://raw.githubusercontent.com/Sparkies01/Splash/main";
const UA = { "User-Agent": "EuphexMLBBAssets/1.0 (+https://github.com/nooryoosuf/euphex)", Accept: "application/vnd.github+json" };

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const SLUG_MAP = { popolandkupa: "popol" };
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-") || "untitled";

async function main() {
  mkdirSync(join(ROOT, "src", "data", "mlbb"), { recursive: true });
  let registry = {};
  try {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
  } catch { /* first run */ }
  const before = Object.keys(registry).length;

  // single API call — full recursive tree (no auth needed)
  const res = await fetch(TREE_API, { headers: UA });
  if (!res.ok) throw new Error(`tree API ${res.status}`);
  const tree = await res.json();
  if (tree.truncated) throw new Error("tree truncated — rerun later");

  const folders = new Map();
  for (const e of tree.tree) {
    if (e.type !== "blob" || !/\.png$/i.test(e.path)) continue;
    const i = e.path.lastIndexOf("/");
    if (i < 0) continue;
    const dir = e.path.slice(0, i);
    const file = e.path.slice(i + 1);
    if (!folders.has(dir)) folders.set(dir, []);
    folders.get(dir).push(file);
  }
  console.log(`${folders.size} hero folders upstream (registry had ${before})`);

  let addedHeroes = 0;
  let addedSkins = 0;
  for (const [folder, files] of [...folders.entries()].sort()) {
    const slug = SLUG_MAP[norm(folder)] ?? norm(folder);
    files.sort((a, b) => a.localeCompare(b));
    const raw = (f) => `${RAW}/${encodeURIComponent(folder)}/${encodeURIComponent(f)}`;

    let entry = registry[slug];
    if (!entry) {
      entry = { id: slug, name: folder, image: "", width: 0, height: 0, skins: [] };
      registry[slug] = entry;
      addedHeroes++;
    }
    entry.name = entry.name || folder;

    // default splash: keep local pick; otherwise first file, remote URL
    if (!entry.image) {
      entry.image = raw(files[0]);
    }

    // skin metadata for every file; keep downloaded records as-is
    const byId = new Map(entry.skins.map((s) => [s.id, s]));
    for (const f of files) {
      const base = f.replace(/\.png$/i, "");
      const id = slugify(base);
      const rec = byId.get(id);
      if (rec) {
        if (!rec.image) {
          rec.image = raw(f);
          addedSkins++;
        }
        if (!rec.name) rec.name = base;
      } else {
        const skin = { id, name: base, image: raw(f), width: 0, height: 0, downloaded: false };
        entry.skins.push(skin);
        byId.set(id, skin);
        addedSkins++;
      }
    }
  }

  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
  console.log(`Done: +${addedHeroes} heroes, +${addedSkins} skin records → ${Object.keys(registry).length} heroes total.`);
}

await main();
