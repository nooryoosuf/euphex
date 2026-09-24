// One-shot art fetcher: pulls official hero renders + portraits from the
// MLBB Wiki (MediaWiki API) into public/images/official/ and writes a
// manifest consumed by src/data/imagery.ts.
//
//   node scripts/fetch-hero-art.mjs [--force]
//
// Artwork © Moonton (via MLBB Wiki). Licensed for fan use — credit kept
// in the site footer.
import { mkdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images", "official");
const API = "https://mobile-legends.fandom.com/api.php";
const UA = "EuphexSite/1.0 (esports fan site; contact via site footer)";
const FORCE = process.argv.includes("--force");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

// slug -> wiki page titles to try (hyphen/space variants)
const HEROES = {
  fanny: ["Fanny"], ling: ["Ling"], hayabusa: ["Hayabusa"], joy: ["Joy"],
  lancelot: ["Lancelot"], aamon: ["Aamon"], gusion: ["Gusion"],
  valentina: ["Valentina"], pharsa: ["Pharsa"], yve: ["Yve"],
  cecilion: ["Cecilion"], luoyi: ["Luo-Yi", "Luo Yi"], aurora: ["Aurora"],
  kagura: ["Kagura"], nana: ["Nana"], xavier: ["Xavier"], hirara: ["Hirara"],
  beatrix: ["Beatrix"], claude: ["Claude"], brody: ["Brody"],
  melissa: ["Melissa"], layla: ["Layla"], lesley: ["Lesley"],
  yuzhong: ["Yu Zhong", "Yu-Zhong"], terizla: ["Terizla"], paquito: ["Paquito"],
  lapulapu: ["Lapu-Lapu", "LapuLapu"], badang: ["Badang"], belerick: ["Belerick"],
  benedetta: ["Benedetta"], estes: ["Estes"], franco: ["Franco"], chou: ["Chou"],
  khufra: ["Khufra"], mathilda: ["Mathilda"], atlas: ["Atlas"],
  angela: ["Angela"], johnson: ["Johnson"], natalia: ["Natalia"],
};

async function pageImages(title) {
  try {
    const j = await getJson({ action: "parse", page: title, prop: "images" });
    return j.parse?.images ?? [];
  } catch {
    return [];
  }
}

async function fileUrl(fileTitle) {
  try {
    const j = await getJson({ action: "query", prop: "imageinfo", iiprop: "url|size", titles: fileTitle });
    const pages = Object.values(j.query?.pages ?? {});
    if (pages[0]?.missing !== undefined) return null;
    return pages[0]?.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

async function download(url, dest) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.ok) {
        writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
        return true;
      }
    } catch { /* retry */ }
    await sleep(400 * (a + 1));
  }
  return false;
}

mkdirSync(OUT, { recursive: true });
const kind = {};
let bytes = 0;

for (const [slug, titles] of Object.entries(HEROES)) {
  const displayDest = join(OUT, `${slug}-display.png`);
  const portraitDest = join(OUT, `${slug}-portrait.png`);
  if (!FORCE && existsSync(displayDest)) {
    kind[slug] = "display";
    console.log(`skip ${slug} (cached display)`);
    continue;
  }
  // 1) find portrait on the hero page (also reveals the hero number)
  let portraitFile = null;
  for (const t of titles) {
    const imgs = await pageImages(t);
    if (!imgs.length) continue;
    const p = imgs.find((i) => /-portrait\.png$/i.test(i));
    const d = imgs.find((i) => /-displaymodel\.png$/i.test(i));
    if (d) {
      portraitFile = { portrait: `File:${p ?? ""}`, display: `File:${d}`, direct: true };
      break;
    }
    if (p) {
      const num = p.match(/Hero(\d+)-portrait\.png$/i)?.[1];
      portraitFile = { portrait: `File:${p}`, probe: num ? `File:Hero${num}-displaymodel.png` : null };
      break;
    }
    await sleep(150);
  }
  if (!portraitFile) {
    console.log(`MISS ${slug} — no portrait found`);
    continue;
  }
  // 2) resolve display: direct, else probe HeroNNN-displaymodel.png existence
  let displayUrl = null;
  if (portraitFile.direct) {
    displayUrl = await fileUrl(portraitFile.display);
  } else if (portraitFile.probe) {
    await sleep(120);
    displayUrl = await fileUrl(portraitFile.probe);
    if (displayUrl) console.log(`probed display for ${slug}`);
  }
  await sleep(120);
  const portraitUrl = portraitFile.portrait ? await fileUrl(portraitFile.portrait) : null;

  const gotDisplay = displayUrl && (FORCE || !existsSync(displayDest)) ? await download(displayUrl, displayDest) : existsSync(displayDest);
  const gotPortrait =
    portraitUrl && (FORCE || !existsSync(portraitDest)) ? await download(portraitUrl, portraitDest) : existsSync(portraitDest);

  if (gotDisplay) {
    kind[slug] = "display";
    bytes += statSync(displayDest).size;
    console.log(`got ${slug} (display)`);
  } else if (gotPortrait) {
    kind[slug] = "portrait";
    bytes += statSync(portraitDest).size;
    console.log(`got ${slug} (portrait only)`);
  } else {
    console.log(`MISS ${slug} — download failed`);
  }
  await sleep(120);
}

writeFileSync(
  join(ROOT, "src", "data", "heroArt.generated.ts"),
  `// AUTO-GENERATED by scripts/fetch-hero-art.mjs — do not edit by hand.\n// Official renders © Moonton (via MLBB Wiki).\nexport const OFFICIAL_HERO_KIND: Record<string, "display" | "portrait"> = ${JSON.stringify(kind, null, 2)};\n`,
);
console.log(`\nDone: ${Object.keys(kind).length}/${Object.keys(HEROES).length} heroes, ${(bytes / 1048576).toFixed(1)} MB new.`);
