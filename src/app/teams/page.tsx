"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TEAMS } from "@/data/teams";
import { getTeamPlayers } from "@/data/players";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { PlayerCard, TeamCard } from "@/components/ui/cards";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const FILTERS = [{ id: "all", label: "All" }, ...TEAMS.map((t) => ({ id: t.slug, label: t.shortName }))];

export default function TeamsPage() {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? TEAMS : TEAMS.filter((t) => t.slug === filter);

  return (
    <>
      <PageHero index="01" label="Compete" title="THE SQUADS." sub="Three squads under one organization. Switch between them — the roster, stats, and story transition with you." image={SECTION_BG.teams} />
      {/* team switcher */}
      <div className="sticky top-16 md:top-20 z-30 border-b border-white/8 bg-[#07090D]/90 backdrop-blur-md" role="tablist" aria-label="Team switcher">
        <div className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-5 md:px-10 py-3">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 px-5 py-2.5 text-[12px] font-bold tracking-[0.18em] uppercase transition-all cursor-pointer",
                filter === f.id ? "bg-[var(--accent)] text-white" : "border border-white/12 text-white/55 hover:text-white hover:border-white/30",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {shown.map((t) => {
              const roster = getTeamPlayers(t.slug);
              const winRate = Math.round((t.wins / Math.max(1, t.wins + t.losses)) * 100);
              return (
                <section key={t.slug} className="mb-16 last:mb-0" aria-label={t.name}>
                  <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-start">
                    <TeamCard team={t} />
                    <div className="grid grid-cols-3 gap-4 border border-white/8 bg-[#0C0F16] p-6">
                      {[
                        [String(t.wins) + "–" + String(t.losses), "Record"],
                        [winRate + "%", "Win rate"],
                        [String(t.championships), "Titles"],
                      ].map(([v, l]) => (
                        <div key={l}>
                          <p className="font-display text-3xl md:text-4xl font-bold tabular-nums">{v}</p>
                          <p className="label mt-1 text-white/40">{l}</p>
                        </div>
                      ))}
                      <div className="col-span-3 flex flex-wrap gap-2 pt-2">
                        <Badge tone="accent">{t.tier}</Badge>
                        {t.playstyle.map((p) => (
                          <Badge key={p}>{p}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <h3 className="label mt-10 mb-5 text-white/40">Current roster — {roster.length} players</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    {roster.map((p, i) => (
                      <PlayerCard key={p.slug} player={p} index={i} />
                    ))}
                  </div>
                </section>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
