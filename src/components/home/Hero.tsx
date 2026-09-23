"use client";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import { IMAGES } from "@/data/imagery";
import { Button } from "@/components/ui/primitives";

/** Slow looping hero — one statement, one world. */
const HERO_ROTATE_MS = 20000;
const HEADLINES: { lines: [string, string]; image: string }[] = [
  { lines: ["WE PLAY", "TO WIN."], image: IMAGES.beatrix },
  { lines: ["BUILT FOR", "THE FIGHT."], image: IMAGES.badang },
  { lines: ["THREE SQUADS.", "ONE STANDARD."], image: IMAGES.lesley },
  { lines: ["PLAY HARD.", "PLAY TOGETHER."], image: IMAGES.kagura },
  { lines: ["OWN THE", "LAND OF DAWN."], image: IMAGES.aurora },
];
const POOL = [IMAGES.beatrix, IMAGES.badang, IMAGES.lesley, IMAGES.kagura, IMAGES.aurora];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // layered parallax — each visual plane drifts at its own speed
  const yBack = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, 320]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // looping headline — alternate reveal direction so it never feels robotic
  const [hi, setHi] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setHi((i) => (i + 1) % HEADLINES.length), HERO_ROTATE_MS);
    return () => clearInterval(t);
  }, [reduce]);
  const { lines, image: main } = HEADLINES[hi];
  const dir = hi % 2 === 0 ? 1 : -1;

  // flanking atmosphere — the next two images in the pool after the main one
  const poolIdx = POOL.indexOf(main);
  const flanks = [POOL[(poolIdx + 1) % POOL.length], POOL[(poolIdx + 2) % POOL.length]];
  const parallax = [yBack, yMid, yFront];

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden" aria-label="Intro">
      {/* ── parallax artwork stack — backdrop swaps with each statement ── */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* warm the cache so every rotation dissolves in, never pops */}
        <div className="hidden">
          {POOL.map((src) => (
            <img key={src} src={src} alt="" loading="eager" />
          ))}
        </div>
        {/* main backdrop */}
        <motion.div style={reduce ? undefined : { y: parallax[0] }} className="absolute inset-[-12%_0]">
          <AnimatePresence mode="sync">
            <motion.img
              key={main}
              src={main}
              alt=""
              loading="eager"
              initial={reduce ? false : { opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.85, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={reduce ? undefined : { opacity: { duration: 1.6, ease: "easeInOut" }, scale: { duration: 22, ease: "linear" } }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
          </AnimatePresence>
        </motion.div>
        {/* flanking layers */}
        {flanks.map((src, i) => (
          <motion.div
            key={`flank-${i}`}
            style={reduce ? undefined : { y: parallax[i + 1] }}
            className="absolute inset-[-12%_0]"
          >
            <AnimatePresence mode="sync">
              <motion.img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={reduce ? undefined : { duration: 1.6, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: i === 0 ? "80% 30%" : "15% 25%",
                  maskImage:
                    i === 0
                      ? "linear-gradient(100deg, transparent 30%, black 75%)"
                      : "linear-gradient(260deg, transparent 30%, black 75%)",
                  WebkitMaskImage:
                    i === 0
                      ? "linear-gradient(100deg, transparent 30%, black 75%)"
                      : "linear-gradient(260deg, transparent 30%, black 75%)",
                }}
              />
            </AnimatePresence>
          </motion.div>
        ))}
        {/* dark cinematic overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,9,13,0.62) 0%, rgba(7,9,13,0.25) 35%, rgba(7,9,13,0.88) 82%, #07090D 100%), radial-gradient(90% 60% at 70% 20%, rgba(227,37,107,0.22), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(115deg, transparent 0 90px, rgba(255,255,255,0.04) 90px 91px)" }}
        />
      </div>

      <motion.div style={reduce ? undefined : { opacity: fade }} className="relative mx-auto w-full max-w-[1400px] px-5 md:px-10 pb-24 pt-40">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="label text-[var(--accent)]"
        >
          {siteConfig.org.fullName} — {siteConfig.org.game}
        </motion.p>
        <h1 className="font-display mt-5 font-bold leading-[0.9] tracking-tight text-[15vw] md:text-[9rem] drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)]">
          <span className="sr-only">Euphex Esports — We play to win.</span>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.span
              key={hi}
              custom={dir}
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } }, exit: { transition: { staggerChildren: 0.06 } } }}
              className="block"
              aria-hidden="true"
            >
              {lines.map((line, li) => (
                <span key={`${hi}-${li}`} className="block overflow-hidden pb-1 -mb-1">
                  <motion.span
                    className="block"
                    custom={dir}
                    variants={{
                      hidden: (d: number) => ({ y: d === 1 ? "108%" : "-108%" }),
                      show: { y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
                      exit: (d: number) => ({ y: d === 1 ? "-108%" : "108%", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
                    }}
                  >
                    {line.endsWith(".") ? (
                      <>
                        {line.slice(0, -1)}
                        <span className={li === 1 ? "text-[var(--accent)]" : ""}>.</span>
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </motion.span>
          </AnimatePresence>
        </h1>
        {/* loop progress */}
        {!reduce && (
          <div className="mt-6 flex items-center gap-3" aria-hidden="true">
            <span className="font-display text-sm font-bold tabular-nums text-white/60">
              0{hi + 1} <span className="text-white/25">/ 0{HEADLINES.length}</span>
            </span>
            <div className="h-px w-40 bg-white/15 overflow-hidden">
              <motion.span
                key={`bar-${hi}`}
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: HERO_ROTATE_MS / 1000, ease: "linear" }}
                className="block h-full w-full bg-[var(--accent)]"
              />
            </div>
            <div className="flex gap-2">
              {HEADLINES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHi(i)}
                  tabIndex={-1}
                  className={`h-1.5 cursor-pointer transition-all ${i === hi ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-white/25 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <p className="max-w-md text-base md:text-lg leading-relaxed text-white/70 drop-shadow-[0_1px_12px_rgba(0,0,0,0.8)]">
            Three squads. One standard. {siteConfig.org.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/teams">Meet the squads</Button>
            <Button href="/matches" variant="ghost">
              Next match
            </Button>
          </div>
        </motion.div>
        <div className="mt-14 flex items-center gap-3 text-white/40" aria-hidden="true">
          <ChevronDown className="size-4 animate-bounce" />
          <span className="label !text-[10px]">Scroll</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="label !text-[10px] hidden md:inline">Season 2026 — Three squads</span>
        </div>
      </motion.div>
    </section>
  );
}

export function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/8 bg-[#0A0D14] py-3" aria-hidden="true">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8 text-[12px] font-bold tracking-[0.22em] text-white/45">
            {t} <span className="text-[var(--accent)]">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
