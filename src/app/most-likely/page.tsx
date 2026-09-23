"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PLAYERS } from "@/data/players";
import { getTeam } from "@/data/teams";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { Artwork } from "@/components/ui/Artwork";
import { MOST_LIKELY_QUESTIONS } from "@/data/roasts";
import { cn } from "@/lib/utils";

export default function MostLikelyPage() {
  const [qi, setQi] = useState(0);
  const [votes, setVotes] = useState<Record<number, Record<string, number>>>({});
  const [voted, setVoted] = useState<Record<number, string>>({});
  const q = MOST_LIKELY_QUESTIONS[qi];
  const tally = useMemo(() => votes[qi] ?? {}, [votes, qi]);
  const total = useMemo(() => Object.values(tally).reduce((a, b) => a + b, 0), [tally]);

  const vote = (slug: string) => {
    if (voted[qi]) return;
    setVoted((v) => ({ ...v, [qi]: slug }));
    setVotes((prev) => ({ ...prev, [qi]: { ...(prev[qi] ?? {}), [slug]: ((prev[qi] ?? {})[slug] ?? 0) + 1 } }));
    // persist shape ready for a backend: localStorage queue
    try {
      const key = "euphex-votes";
      const cur = JSON.parse(localStorage.getItem(key) ?? "{}");
      cur[`${qi}:${slug}`] = (cur[`${qi}:${slug}`] ?? 0) + 1;
      localStorage.setItem(key, JSON.stringify(cur));
    } catch { /* noop */ }
  };

  return (
    <>
      <PageHero index="12" label="Fan zone" title="MOST LIKELY TO…" sub="Vote for the squad. Expose them lovingly. Results animate live." image={SECTION_BG["most-likely"]} />
      <div className="mx-auto max-w-[1100px] px-5 md:px-10 py-12">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Questions">
          {MOST_LIKELY_QUESTIONS.map((qq, i) => (
            <button
              key={qq}
              role="tab"
              aria-selected={qi === i}
              onClick={() => setQi(i)}
              className={cn(
                "shrink-0 max-w-[240px] truncate border px-4 py-2.5 text-left text-[12px] font-bold tracking-wide cursor-pointer transition-all",
                qi === i ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-white/12 text-white/55 hover:text-white",
              )}
            >
              {i + 1}. {qq}
            </button>
          ))}
        </div>

        <h2 className="font-display mt-8 text-3xl md:text-5xl font-bold tracking-tight">{q}</h2>
        <p className="label mt-2 text-white/40" role="status">
          {total} vote{total === 1 ? "" : "s"} {voted[qi] ? "· you voted" : "· tap a player"}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {PLAYERS.filter((p) => p.teamSlug === "main").map((p) => {
            const pct = total ? Math.round(((tally[p.slug] ?? 0) / total) * 100) : 0;
            const mine = voted[qi] === p.slug;
            return (
              <button
                key={p.slug}
                onClick={() => vote(p.slug)}
                disabled={!!voted[qi]}
                className={cn(
                  "group relative overflow-hidden border text-left transition-all cursor-pointer",
                  mine ? "border-[var(--accent)]" : "border-white/10 hover:border-white/35",
                  voted[qi] && !mine && "opacity-80",
                )}
                aria-label={`Vote ${p.gamertag}`}
              >
                <Artwork hue={p.hue} label={p.gamertag.slice(0, 2)} className="aspect-[3/4] w-full" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-10">
                  <span className="font-display block text-xl font-bold">{p.gamertag}</span>
                  <span className="text-[11px] tracking-[0.14em] uppercase text-white/50">{getTeam(p.teamSlug)?.shortName} · {p.role}</span>
                  {total > 0 && (
                    <span className="mt-2 block">
                      <span className="block h-1.5 bg-white/15">
                        <motion.span
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7 }}
                          className={cn("block h-full", mine ? "bg-[var(--accent)]" : "bg-white/50")}
                        />
                      </span>
                      <span className="mt-1 block text-xs font-bold tabular-nums">{pct}%</span>
                    </span>
                  )}
                </span>
                {mine && <span className="absolute top-2 right-2 bg-[var(--accent)] px-2 py-1 text-[10px] font-bold tracking-widest">YOU</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-white/35">Voting persists locally; API-ready shape stored for a future backend.</p>
      </div>
    </>
  );
}
