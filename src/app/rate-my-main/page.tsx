"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { rateMain } from "@/data/roasts";
import { HERO_LIST } from "@/data/heroes";

export default function RateMainPage() {
  const [hero, setHero] = useState("Fanny");
  const [rated, setRated] = useState(false);
  const data = rateMain(hero);

  return (
    <>
      <PageHero index="11" label="Fan zone" title="RATE MY MAIN." sub="Our analysts (a spreadsheet and vibes) deliver the objective truth." image={SECTION_BG["rate-my-main"]} />
      <div className="mx-auto max-w-[800px] px-5 md:px-10 py-12 md:py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setRated(true);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <label className="flex-1 border border-white/12 bg-[#0C0F16] p-4">
            <span className="sr-only">Select hero</span>
            <select value={hero} onChange={(e) => { setHero(e.target.value); setRated(false); }} className="w-full bg-transparent text-xl font-bold focus:outline-none [&>option]:bg-black">
              {HERO_LIST.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="bg-[var(--accent)] px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase clip-slant hover:brightness-110 cursor-pointer transition-all">
            Analyze →
          </button>
        </form>

        {rated && (
          <motion.div key={hero} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 border border-white/10 bg-[#0C0F16] p-8">
            <p className="label text-white/40">Analyst report — {hero.toUpperCase()}</p>
            <div className="mt-6 space-y-5">
              {data.stats.map((s, i) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[12px] font-bold tracking-[0.16em]">
                    <span className="text-white/60">{s.label}</span>
                    <span className="tabular-nums">{s.value}/10</span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10" role="img" aria-label={`${s.label} ${s.value} out of 10`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value * 10}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-[var(--accent)]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <blockquote className="font-display mt-8 border-l-2 border-[var(--accent)] pl-5 text-2xl font-medium italic">
              “{data.verdict}”
            </blockquote>
          </motion.div>
        )}
      </div>
    </>
  );
}
