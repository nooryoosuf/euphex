"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG, IMAGES } from "@/data/imagery";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Phase = "idle" | "countdown" | "live" | "round" | "final";

interface Rank {
  name: string;
  color: string;
  maxErr: number;
}

// error windows in ms — lower is holier
const RANKS: Rank[] = [
  { name: "IMMORTAL", color: "#FFFFFF", maxErr: 8 },
  { name: "MYTHICAL GLORY", color: "#FFD166", maxErr: 15 },
  { name: "MYTHICAL HONOR", color: "#F4A261", maxErr: 35 },
  { name: "MYTHIC", color: "#E3256B", maxErr: 70 },
  { name: "LEGEND", color: "#9B5DE5", maxErr: 120 },
  { name: "EPIC", color: "#4CC9F0", maxErr: 180 },
  { name: "GRANDMASTER", color: "#80ED99", maxErr: 260 },
  { name: "MASTER", color: "#95D5B2", maxErr: 400 },
  { name: "ELITE", color: "#9AA3B2", maxErr: Infinity },
];

const ROASTS: Record<string, string[]> = {
  IMMORTAL: [
    "IMMORTAL. The Lord now asks YOU for permission to spawn.",
    "Sub-8ms. Frame-perfect. Moonton wants your finger studied.",
  ],
  "MYTHICAL GLORY": [
    "The Lord apologized to YOU. Retri him in scrims immediately.",
    "0.015s. Moonton is patching the Lord because of you.",
  ],
  "MYTHICAL HONOR": [
    "Honor-level hands. The pit fears your finger.",
    "So close to Glory the Lord started sweating.",
  ],
  MYTHIC: [
    "Mythic timing. Your jungler still blames you, but that's tradition.",
    "Clean retri. Shame about everything else you do.",
  ],
  LEGEND: [
    "Legend hands, Epic brain. The retri was the best part of you.",
    "Respectable. The enemy jungler only stole two Lords, not three.",
  ],
  EPIC: [
    "Epic timing — the Lord died of old age waiting for your retri.",
    "You secure objectives the way layoffs secure morale: eventually.",
  ],
  GRANDMASTER: [
    "Grandmaster hands. The Turtle sends condolences.",
    "Your retri button and your map awareness have never met.",
  ],
  MASTER: [
    "Master rank. The Lord has filed a noise complaint about your attempts.",
    "You press Retri like you're voting — late and for the wrong side.",
  ],
  ELITE: [
    "Elite. The Lord pit now has your name on a memorial plaque.",
    "Your Retribution could miss a stationary creep. It just did.",
  ],
  WHIFFED: [
    "You smote the AIR. The Lord wasn't even born yet.",
    "That wasn't early — that was a different game entirely.",
  ],
};

const TOTAL_ROUNDS = 3;
const BEST_KEY = "euphex-retri-best";

// each stage: retri window (%) shrinks while the Lord drains faster
const STAGES = [
  { pct: 8, minD: 4400, maxD: 5600, label: "WARMUP" },
  { pct: 6, minD: 3600, maxD: 4800, label: "PRESSURE" },
  { pct: 4, minD: 2800, maxD: 3800, label: "FINAL" },
];

function rankFor(err: number | null): { rank: Rank; whiffed: boolean } {
  if (err === null) return { rank: RANKS[RANKS.length - 1], whiffed: true };
  const a = Math.abs(err);
  return { rank: RANKS.find((r) => a <= r.maxErr) ?? RANKS[RANKS.length - 1], whiffed: false };
}

export default function RetriTestPage() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);
  const [round, setRound] = useState(0);
  const [errs, setErrs] = useState<number[]>([]);
  const [lastErr, setLastErr] = useState<number | null>(null);
  const [lastMissed, setLastMissed] = useState(false);
  const [best, setBest] = useState<number | null>(() => {
    try {
      const b = localStorage.getItem(BEST_KEY);
      return b ? Number(b) : null;
    } catch {
      return null;
    }
  });
  const [shake, setShake] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const t0 = useRef(0);
  const dur = useRef(4500);
  const target = useRef(8);
  const live = useRef(false);
  const [liveKey, setLiveKey] = useState(0);

  useEffect(() => {
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const startRound = () => {
    setPhase("countdown");
    setCount(3);
    let c = 3;
    const tick = () => {
      c -= 1;
      if (c <= 0) {
        setLiveKey((k) => k + 1);
        setPhase("live");
      } else {
        setCount(c);
        setTimeout(tick, 650);
      }
    };
    setTimeout(tick, 650);
  };

  const registerTap = (at: number | null) => {
    cancelAnimationFrame(raf.current);
    live.current = false;
    setLastMissed(at === null);
    let err: number | null = null;
    if (at !== null) {
      // perfect tap lands when HP hits the stage target
      const tTarget = t0.current + dur.current * (1 - target.current / 100);
      err = at - tTarget;
      // absurdly early = whiffed the concept of time
      if (at - t0.current < dur.current * 0.4) err = null;
    }
    setLastErr(err);
    setShake((s) => s + 1);
    setPhase("round");
  };

  // round setup lives in an effect — randomized timing is a side effect, not render
  useEffect(() => {
    if (liveKey === 0) return;
    const stage = STAGES[Math.min(round, STAGES.length - 1)];
    target.current = stage.pct;
    dur.current = stage.minD + Math.random() * (stage.maxD - stage.minD);
    t0.current = performance.now();
    live.current = true;
    const step = (t: number) => {
      if (!live.current) return;
      const p = Math.min(1, (t - t0.current) / dur.current);
      if (barRef.current) barRef.current.style.width = `${(1 - p) * 100}%`;
      if (p >= 1) {
        live.current = false;
        registerTap(null);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      live.current = false;
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveKey]);

  const tap = () => {
    if (phase !== "live" || !live.current) return;
    registerTap(performance.now());
  };

  const next = () => {
    const nextErrs = [...errs, lastErr ?? 9999];
    setErrs(nextErrs);
    setLastErr(null);
    if (round + 1 >= TOTAL_ROUNDS) {
      const avg = nextErrs.reduce((a, b) => a + Math.min(b, 1500), 0) / nextErrs.length;
      try {
        const prev = Number(localStorage.getItem(BEST_KEY) ?? Infinity);
        if (avg < prev) {
          localStorage.setItem(BEST_KEY, String(Math.round(avg)));
          setBest(Math.round(avg));
        }
      } catch { /* ignore */ }
      setPhase("final");
    } else {
      setRound(round + 1);
      startRound();
    }
  };

  const restart = () => {
    setErrs([]);
    setRound(0);
    setLastErr(null);
    startRound();
  };

  const avg = errs.length ? errs.reduce((a, b) => a + Math.min(b, 1500), 0) / errs.length : null;
  const final = avg !== null ? rankFor(avg > 900 ? 99999 : avg) : null;
  const finalRank = final?.whiffed ? { name: "WARRIOR", color: "#8D99AE" } : final?.rank;
  const roastPool = finalRank ? (ROASTS[finalRank.name] ?? ROASTS.ELITE) : [];
  const roast = roastPool.length ? roastPool[Math.abs(Math.round(avg ?? 0)) % roastPool.length] : "";
  const last = lastErr !== null ? rankFor(lastErr) : { rank: RANKS[RANKS.length - 1], whiffed: true };

  return (
    <>
      <PageHero
        index="13"
        label="Fan zone"
        title="RETRI TEST."
        sub="Three stages, shrinking windows, quickening Lord. Your finger is the only thing between victory and the enemy Ling typing “thanks”."
        image={IMAGES.atlas}
      />
      <div className="mx-auto max-w-[760px] px-5 md:px-10 py-12 md:py-16">
        {/* scoreboard */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2" aria-label={`Round ${round + 1} of ${TOTAL_ROUNDS}`}>
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-10",
                  i < errs.length ? "bg-[var(--accent)]" : i === round && phase !== "idle" && phase !== "final" ? "bg-white/60" : "bg-white/12",
                )}
              />
            ))}
          </div>
          <p className="label text-white/40" role="status">
            {best !== null ? `Best avg ${best}ms` : "No attempts yet"}
          </p>
        </div>

        {/* arena */}
        <motion.div
          key={shake}
          animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
          transition={{ duration: 0.4 }}
          className="grain relative mt-6 overflow-hidden border border-white/10 bg-[#0C0F16] p-6 md:p-10"
        >
          <div className="flex items-center gap-4">
            <img src={IMAGES.atlas} alt="" aria-hidden="true" className="size-14 md:size-16 rounded-full object-cover object-[center_20%] border-2 border-[var(--accent)]/60" />
            <div>
              <p className="label text-[var(--accent)]">Lord pit — enhanced Lord · Stage {round + 1} {STAGES[Math.min(round, STAGES.length - 1)].label}</p>
              <p className="font-display text-2xl md:text-3xl font-bold">RETRI AT {STAGES[Math.min(round, STAGES.length - 1)].pct}%.</p>
            </div>
          </div>

          {/* HP bar */}
          <div className="mt-8" aria-hidden="true">
            <div className="relative h-12 md:h-14 overflow-hidden border border-white/15 bg-black/60">
              <div ref={barRef} className="h-full bg-gradient-to-r from-[#E3256B] via-[#F4A261] to-[#FFD166]" style={{ width: "100%" }} />
              {/* retri line */}
              <div className="absolute inset-y-0 left-0 border-l-2 border-[#FFD166] bg-[#FFD166]/20" style={{ width: `${STAGES[Math.min(round, STAGES.length - 1)].pct}%` }} />
              <span className="absolute left-1 top-1 text-[10px] font-bold tracking-[0.2em] text-[#FFD166]">RETRI</span>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-display text-xl font-bold tabular-nums text-black/60">LORD</span>
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-bold tracking-[0.18em] text-white/35">
              <span>100%</span>
              <span className="text-[#FFD166]">RETRI WINDOW {STAGES[Math.min(round, STAGES.length - 1)].pct}% → 0%</span>
              <span>0%</span>
            </div>
          </div>

          {/* stage */}
          <div className="mt-8 min-h-[190px] flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-white/60 max-w-md">Three rounds. Tap RETRI the instant the bar hits the gold zone. Average error decides your rank.</p>
                  <button onClick={restart} className="mt-6 bg-[var(--accent)] px-10 py-4 text-sm font-bold tracking-[0.2em] uppercase clip-slant hover:brightness-110 cursor-pointer">
                    Enter the pit →
                  </button>
                </motion.div>
              )}
              {phase === "countdown" && (
                <motion.p key={`c-${count}-${round}`} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-8xl font-bold tabular-nums">
                  {count}
                </motion.p>
              )}
              {phase === "live" && (
                <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
                  <button
                    onClick={tap}
                    aria-label="Cast Retri now"
                    className="inline-flex cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  >
                    <img src={IMAGES.retri} alt="" aria-hidden="true" className="size-24 md:size-28 rounded-full object-cover drop-shadow-[0_0_28px_rgba(227,37,107,0.65)]" />
                  </button>
                  <p className="label mt-4 text-white/60">Retri — tap exactly on the line</p>
                </motion.div>
              )}
              {phase === "round" && (
                <motion.div key={`r-${round}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {lastMissed ? (
                    <>
                      <Badge>MISSED</Badge>
                      <p className="font-display mt-3 text-4xl font-bold">MISSED.</p>
                      <p className="mt-1 text-white/55">No retri. The Lord died uncontested and the enemy jungler sends thanks.</p>
                    </>
                  ) : last.whiffed ? (
                    <>
                      <Badge>WHIFFED</Badge>
                      <p className="font-display mt-3 text-4xl font-bold">TOO EARLY.</p>
                      <p className="mt-1 text-white/55">The Lord hadn&rsquo;t even spawned. Incredible.</p>
                    </>
                  ) : (
                    <>
                      <Badge tone={Math.abs(lastErr ?? 999) <= 70 ? "win" : Math.abs(lastErr ?? 999) <= 180 ? "draw" : "loss"}>
                        {(lastErr ?? 0) <= 0 ? `${Math.abs(Math.round(lastErr ?? 0))}MS EARLY` : `${Math.abs(Math.round(lastErr ?? 0))}MS LATE`}
                      </Badge>
                      <p className="font-display mt-3 text-4xl font-bold" style={{ color: last.rank.color }}>
                        {last.rank.name}
                      </p>
                      <p className="mt-1 text-white/55">
                        {(lastErr ?? 0) < -15
                          ? "Too early — enemy secures the Lord."
                          : (lastErr ?? 0) > 15
                            ? "Too late — stolen."
                            : "SECURED. Clean retri."}
                      </p>
                    </>
                  )}
                  <button onClick={next} className="mt-6 border border-white/15 px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:border-[var(--accent)] cursor-pointer">
                    {round + 1 >= TOTAL_ROUNDS ? "See verdict →" : "Next round →"}
                  </button>
                </motion.div>
              )}
              {phase === "final" && finalRank && (
                <motion.div key="final" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                  <p className="label text-white/40">Final verdict — avg {Math.round(avg ?? 0)}ms</p>
                  <p className="font-display mt-2 text-5xl md:text-7xl font-bold tracking-tight" style={{ color: finalRank.color }}>
                    {finalRank.name}
                  </p>
                  <blockquote className="mx-auto mt-4 max-w-md border-l-2 border-[var(--accent)] pl-4 text-left text-lg italic text-white/80">
                    “{roast}”
                  </blockquote>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={restart} className="bg-[var(--accent)] px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 cursor-pointer">
                      Run it back
                    </button>
                    <Link href="/roast" className="border border-white/15 px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase hover:border-[var(--accent)]">
                      Get roasted →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* rank ladder */}
        <div className="mt-8 border border-white/8 bg-[#0C0F16] p-5 md:p-6">
          <p className="label text-white/40 mb-4">The ladder — average error, 3 rounds</p>
          <ol className="space-y-1.5">
            {RANKS.map((r) => (
              <li key={r.name} className="flex items-center justify-between text-sm">
                <span className="font-bold" style={{ color: r.color }}>{r.name}</span>
                <span className="tabular-nums text-white/45">≤ {r.maxErr === Infinity ? "∞" : `${r.maxErr}ms`}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-6 text-center text-xs text-white/35">
          Best played with sound on and friends watching. Misses areRoast fuel — the pit remembers.
        </p>
      </div>
    </>
  );
}
