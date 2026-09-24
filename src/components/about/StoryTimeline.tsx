"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { TIMELINE } from "@/data/content";
import { IMAGES } from "@/data/imagery";
import { cn } from "@/lib/utils";

// One artwork per era — the story crossfades as you scroll.
const ERA_ART = [IMAGES.aamon, IMAGES.badang, IMAGES.beatrix, IMAGES.zetian];

/**
 * Pinned scroll-driven story: the section locks for 4 viewport heights
 * while artwork + era text crossfade per chapter. A rail tracks progress
 * and jumps to any year.
 */
export function StoryTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(TIMELINE.length - 1, Math.max(0, Math.floor(v * TIMELINE.length)));
    setActive(i);
  });

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (total * (i + 0.5)) / TIMELINE.length, behavior: reduce ? "auto" : "smooth" });
  };

  // Reduced motion: calm stacked chapters, no pinning.
  if (reduce) {
    return (
      <section aria-label="Our story" className="mx-auto max-w-[1400px] px-5 md:px-10 py-20">
        <p className="label text-white/40">Since 2023</p>
        <h2 className="font-display mt-2 text-4xl md:text-6xl font-bold tracking-tight">THE STORY SO FAR.</h2>
        <ol className="mt-10 space-y-4">
          {TIMELINE.map((e, i) => (
            <li key={e.year} className="grid gap-6 border border-white/8 bg-[#0C0F16] p-6 md:grid-cols-[280px_1fr] md:p-8">
              <img src={ERA_ART[i % ERA_ART.length]} alt="" className="aspect-[16/9] w-full object-cover object-[center_20%]" />
              <div>
                <p className="font-display text-4xl font-bold text-[var(--accent)]">{e.year}</p>
                <p className="font-display mt-2 text-xl font-bold">{e.title}</p>
                <p className="mt-1 text-white/55">{e.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const era = TIMELINE[active];

  return (
    <div ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-end overflow-hidden">
        {/* crossfading era artwork */}
        <div className="absolute inset-0" aria-hidden="true">
          <AnimatePresence mode="sync">
            <motion.img
              key={active}
              src={ERA_ART[active % ERA_ART.length]}
              alt=""
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.9, ease: "easeInOut" }, scale: { duration: 6, ease: "linear" } }}
              className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
            />
          </AnimatePresence>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.55) 0%, rgba(7,9,13,0.25) 40%, rgba(7,9,13,0.94) 88%, #07090D 100%)" }}
          />
        </div>

        {/* chapter text */}
        <div className="relative mx-auto w-full max-w-[1400px] px-5 md:px-10 pb-16 md:pb-20">
          <p className="label text-white/50">Since 2023 — scroll the story</p>
          <div className="mt-4 min-h-[190px] md:min-h-[230px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -28 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-display text-7xl md:text-9xl font-bold leading-none tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.7)]">
                  {era.year}
                </p>
                <p className="font-display mt-3 text-2xl md:text-4xl font-bold tracking-tight text-[var(--accent)]">
                  {era.title}
                </p>
                <p className="mt-2 max-w-xl text-base md:text-lg text-white/70">{era.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* rail: progress + year jumps */}
          <div className="mt-8 flex items-center gap-4">
            <span className="font-display text-sm font-bold tabular-nums text-white/60">
              0{active + 1} <span className="text-white/25">/ 0{TIMELINE.length}</span>
            </span>
            <div className="relative h-px flex-1 bg-white/15">
              <motion.span
                className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                style={{ width: "100%", scaleX: scrollYProgress, transformOrigin: "left" }}
              />
            </div>
            <div className="flex gap-2" role="tablist" aria-label="Jump to year">
              {TIMELINE.map((e, i) => (
                <button
                  key={e.year}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => go(i)}
                  className={cn(
                    "px-2 py-1 font-display text-sm font-bold tabular-nums cursor-pointer transition-colors",
                    i === active ? "text-white" : "text-white/35 hover:text-white/70",
                  )}
                >
                  {e.year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
