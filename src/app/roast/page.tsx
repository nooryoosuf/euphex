"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG, roastHeroArt } from "@/data/imagery";
import { Badge } from "@/components/ui/primitives";
import { generateRoast, ROAST_LEVELS, type RoastLevel, type RoastResult, type RoleKey } from "@/data/roasts";
import { EuphexLogo } from "@/components/ui/TeamLogos";
import { renderRoastCard, shareRoastCard } from "@/lib/roastCard";

const ROLES: RoleKey[] = ["Jungle", "Mid Lane", "Gold Lane", "EXP Lane", "Roam"];
const LOAD_LINES = ["ANALYZING PLAYER...", "READING YOUR ROLE...", "ASSOCIATING HERO...", "CALCULATING DAMAGE..."];

export default function RoastPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<RoleKey>("Jungle");
  const [level, setLevel] = useState<RoastLevel>("spicy");
  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [shareState, setShareState] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // secret keyboard sequence easter egg: type "lord"
  useEffect(() => {
    let buf = "";
    const fn = (e: KeyboardEvent) => {
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === "lord") alert("SECRET MODE UNLOCKED — THE ROASTER respects your bush game.");
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // paint the shareable story card when a roast lands
  useEffect(() => {
    if (phase !== "ready" || !result || !canvasRef.current) return;
    let live = true;
    renderRoastCard({
      title: result.title,
      roast: result.roast,
      name: name.trim() || "Rookie",
      role,
      hero: result.hero,
      level,
      heroImage: roastHeroArt(result.hero),
    }).then((painted) => {
      if (!live || !canvasRef.current) return;
      const host = canvasRef.current;
      host.width = painted.width;
      host.height = painted.height;
      host.getContext("2d")?.drawImage(painted, 0, 0);
    });
    return () => {
      live = false;
    };
  }, [phase, result, name, role, level]);

  const roast = () => {
    setPhase("loading");
    setResult(null);
    setShareState(null);
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => {
        setResult(generateRoast({ name, role, level }));
        setPhase("ready");
      }, 2600),
    ];
  };

  const onShare = async () => {
    if (!canvasRef.current || !result) return;
    setShareState("Preparing card…");
    const outcome = await shareRoastCard(canvasRef.current);
    setShareState(
      outcome === "shared"
        ? "Shared — go tag us."
        : outcome === "downloaded"
          ? "Saved as PNG — post it anywhere."
          : "Card ready below — screenshot it.",
    );
  };

  const heroArt = result ? roastHeroArt(result.hero) : null;

  return (
    <>
      <PageHero index="09" label="Fan zone" title="ROAST THE ROSTER." sub="Think you can survive our players? Enter your name, pick your role — the Roaster associates the hero and does the rest." image={SECTION_BG.roast} />
      <div className="mx-auto max-w-[1100px] px-5 md:px-10 py-12 md:py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            roast();
          }}
          className="grid gap-5 md:grid-cols-2"
        >
          <label className="border border-white/12 bg-[#0C0F16] p-5 block">
            <span className="label text-white/40">Enter your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed"
              maxLength={24}
              className="font-display mt-3 w-full bg-transparent text-2xl font-bold placeholder:text-white/25 focus:outline-none"
            />
          </label>
          <label className="border border-white/12 bg-[#0C0F16] p-5 block">
            <span className="label text-white/40">Select your role</span>
            <select value={role} onChange={(e) => setRole(e.target.value as RoleKey)} className="mt-3 w-full bg-transparent text-xl font-bold focus:outline-none [&>option]:bg-black">
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <fieldset className="md:col-span-2">
            <legend className="label text-white/40 mb-3">Roast level</legend>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Roast level">
              {ROAST_LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={level === l.id}
                  onClick={() => setLevel(l.id)}
                  className={`border p-4 text-left cursor-pointer transition-all ${level === l.id ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-white/12 hover:border-white/30"}`}
                >
                  <span className="font-display text-lg font-bold">{l.label}</span>
                  <span className="block text-xs text-white/50">{l.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="md:col-span-2 bg-[var(--accent)] py-5 text-sm font-bold tracking-[0.2em] uppercase clip-slant hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
            disabled={phase === "loading"}
          >
            {phase === "loading" ? "COOKING…" : "ROAST ME →"}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 border border-white/10 bg-[#0C0F16] p-8 text-center"
              role="status"
              aria-live="polite"
            >
              {LOAD_LINES.map((l, i) => (
                <motion.p
                  key={l}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.55 }}
                  className="font-mono text-sm tracking-[0.2em] text-white/60 py-1"
                >
                  {l}
                </motion.p>
              ))}
              <div className="mx-auto mt-5 h-2 max-w-md bg-white/10 overflow-hidden" aria-hidden="true">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "88%" }}
                  transition={{ duration: 2.4, ease: "easeInOut" }}
                  className="h-full bg-[var(--accent)]"
                />
              </div>
            </motion.div>
          )}
          {phase === "ready" && result && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]"
            >
              {/* roast reveal */}
              <div className="grain relative overflow-hidden border border-[var(--accent)]/40 bg-[#0C0F16]">
                {heroArt && (
                  <img src={heroArt} alt="" aria-hidden="true" className="block h-56 md:h-72 w-full object-cover object-[center_15%]" />
                )}
                {heroArt && (
                  <div className="absolute inset-x-0 top-0 h-56 md:h-72 bg-gradient-to-t from-[#0C0F16] via-transparent to-transparent" aria-hidden="true" />
                )}
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3">
                    <EuphexLogo className="size-7 text-white" />
                    <p className="label text-white/50">The Roaster has associated you with</p>
                  </div>
                  <p className="font-display mt-3 text-5xl md:text-6xl font-bold tracking-tight">
                    {result.hero.toUpperCase()}
                  </p>
                  <p className="label mt-2 text-[var(--accent)]">{role.toUpperCase()} DIFF, CERTIFIED</p>
                  <p className="font-display mt-6 text-3xl font-bold text-red-400">{result.title} 💀</p>
                  <p className="mt-4 max-w-xl text-lg leading-relaxed whitespace-pre-line">{result.roast}</p>
                  <p className="label mt-6 text-white/40">
                    {(name.trim() || "Rookie").toUpperCase()} · {role.toUpperCase()} · {result.hero.toUpperCase()}
                  </p>
                  <div className="mt-6">
                    <Badge tone="accent">{level.toUpperCase()}</Badge>
                  </div>
                </div>
              </div>
              {/* shareable story card */}
              <div className="border border-white/10 bg-[#0C0F16] p-5">
                <p className="label text-white/40">Story card — 9:16</p>
                <canvas ref={canvasRef} className="mt-4 aspect-[9/16] w-full border border-white/10" aria-label="Shareable roast card preview" />
                <div className="mt-4 grid gap-2">
                  <button
                    onClick={onShare}
                    className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] px-5 py-3.5 text-xs font-bold tracking-[0.18em] uppercase hover:brightness-110 cursor-pointer transition-all"
                  >
                    <Share2 className="size-4" /> Share to story
                  </button>
                  <button
                    onClick={roast}
                    className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3.5 text-xs font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] cursor-pointer transition-colors"
                  >
                    <Download className="size-4" /> Roast again
                  </button>
                </div>
                {shareState && (
                  <p className="mt-3 text-center text-xs text-white/55" role="status">
                    {shareState}
                  </p>
                )}
                <p className="mt-3 text-center text-[11px] leading-relaxed text-white/35">
                  Share opens Instagram / TikTok / Discord directly on mobile, downloads the PNG everywhere else.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-8 text-center text-xs text-white/35">All roasts are playful banter. No feelings were harmed — only KDAs.</p>
      </div>
    </>
  );
}
