"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { Badge } from "@/components/ui/primitives";
import { generateRoast, ROAST_LEVELS, type RoastLevel, type RoleKey } from "@/data/roasts";
import { HERO_LIST } from "@/data/heroes";
import { OrgMark } from "@/components/ui/Artwork";

const ROLES: RoleKey[] = ["Jungle", "Mid Lane", "Gold Lane", "EXP Lane", "Roam"];
const LOAD_LINES = ["ANALYZING PLAYER...", "LOADING HERO DATA...", "CALCULATING DAMAGE..."];

export default function RoastPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<RoleKey>("Jungle");
  const [hero, setHero] = useState("Fanny");
  const [level, setLevel] = useState<RoastLevel>("spicy");
  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [result, setResult] = useState<{ roast: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const roast = () => {
    setPhase("loading");
    setResult(null);
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => {
        setResult(generateRoast({ name, role, hero, level }));
        setPhase("ready");
      }, 2100),
    ];
  };

  const share = async () => {
    const text = `I got roasted by EUPHEX as ${name || "Rookie"} (${role} / ${hero}): "${result?.roast}" — get yours at euphex.gg/roast`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <PageHero index="09" label="Fan zone" title="ROAST THE ROSTER." sub="Think you can survive our players? Enter your name, pick your poison, and take the damage." image={SECTION_BG.roast} />
      <div className="mx-auto max-w-[1100px] px-5 md:px-10 py-12 md:py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            roast();
          }}
          className="grid gap-5 md:grid-cols-3"
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
          <label className="border border-white/12 bg-[#0C0F16] p-5 block">
            <span className="label text-white/40">Select your main hero</span>
            <select value={hero} onChange={(e) => setHero(e.target.value)} className="mt-3 w-full bg-transparent text-xl font-bold focus:outline-none [&>option]:bg-black">
              {HERO_LIST.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          <fieldset className="md:col-span-3">
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
            className="md:col-span-3 bg-[var(--accent)] py-5 text-sm font-bold tracking-[0.2em] uppercase clip-slant hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
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
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-[var(--accent)]"
                />
              </div>
            </motion.div>
          )}
          {phase === "ready" && result && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grain relative mt-10 overflow-hidden border border-[var(--accent)]/40 bg-[#0C0F16] p-8 md:p-12 text-center"
            >
              <div className="mx-auto flex max-w-md items-center justify-center gap-3">
                <OrgMark className="size-8 text-white" />
                <p className="label text-white/50">Euphex roast card — euphex.gg</p>
              </div>
              <p className="font-display mt-6 text-4xl md:text-5xl font-bold text-red-400">{result.title} 💀</p>
              <p className="mx-auto mt-4 max-w-xl text-lg md:text-xl leading-relaxed whitespace-pre-line">{result.roast}</p>
              <p className="label mt-6 text-white/40">
                {(name || "Rookie").toUpperCase()} · {role.toUpperCase()} · {hero.toUpperCase()}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Badge tone="accent">{level.toUpperCase()}</Badge>
                <button onClick={roast} className="border border-white/15 px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] cursor-pointer transition-colors">
                  Roast again
                </button>
                <button onClick={share} className="bg-white text-black px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase hover:bg-[var(--accent)] hover:text-white cursor-pointer transition-colors">
                  {copied ? "Copied ✓" : "Share roast"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-8 text-center text-xs text-white/35">All roasts are playful banter. No feelings were harmed — only KDAs.</p>
      </div>
    </>
  );
}
