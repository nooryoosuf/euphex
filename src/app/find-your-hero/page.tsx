"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { Badge } from "@/components/ui/primitives";
import { quizHero } from "@/data/roasts";

const STEPS = [
  {
    key: "style",
    q: "What's your playstyle?",
    options: ["AGGRESSIVE", "TACTICAL", "SUPPORTIVE", "CHAOTIC"],
  },
  {
    key: "death",
    q: "Your teammate just died. You…",
    options: ["FIGHT", "RUN", "REVENGE", "BLAME THE JUNGLER"],
  },
  {
    key: "vibe",
    q: "Pick your energy.",
    options: ["MECHANICAL", "STRATEGIC", "TEAM-FOCUSED", "PURE CHAOS"],
  },
] as const;

export default function FindHeroPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const step = STEPS.find((s) => !answers[s.key]);
  const result = done ? quizHero({ style: answers.style, death: answers.death, vibe: answers.vibe }) : null;

  return (
    <>
      <PageHero index="10" label="Fan zone" title="FIND YOUR HERO." sub="Three questions. Zero mercy. One destiny." image={SECTION_BG["find-your-hero"]} />
      <div className="mx-auto max-w-[800px] px-5 md:px-10 py-12 md:py-16">
        {!done && step && (
          <div key={step.key}>
            <p className="label text-[var(--accent)]">
              Question {Object.keys(answers).length + 1} / {STEPS.length}
            </p>
            <h2 className="font-display mt-3 text-3xl md:text-5xl font-bold tracking-tight">{step.q}</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {step.options.map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    const next = { ...answers, [step.key]: o };
                    setAnswers(next);
                    if (STEPS.every((s) => next[s.key])) setDone(true);
                  }}
                  className="border border-white/12 bg-[#0C0F16] p-6 text-left font-display text-xl font-bold hover:border-[var(--accent)] hover:bg-[var(--accent)]/8 cursor-pointer transition-all"
                >
                  {o}
                </button>
              ))}
            </div>
            {/* progress */}
            <div className="mt-8 flex gap-2" aria-hidden="true">
              {STEPS.map((s) => (
                <span key={s.key} className={`h-1 flex-1 ${answers[s.key] ? "bg-[var(--accent)]" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
        )}
        {done && result && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="border border-[var(--accent)]/40 bg-[#0C0F16] p-8 md:p-12 text-center">
            <p className="label text-white/40">Your hero</p>
            <p className="font-display mt-3 text-6xl md:text-8xl font-bold tracking-tight">{result.hero.toUpperCase()}</p>
            <p className="label mt-3 text-[var(--accent)]">{result.lane}</p>
            <div className="mt-4 flex justify-center gap-2">
              {result.traits.map((t) => (
                <Badge key={t} tone="accent">{t}</Badge>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-md text-lg text-white/70">{result.blurb}</p>
            <button
              onClick={() => {
                setAnswers({});
                setDone(false);
              }}
              className="mt-8 border border-white/15 px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] cursor-pointer transition-colors"
            >
              Retake quiz
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
