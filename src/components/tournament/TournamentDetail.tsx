"use client";
import { useState } from "react";
import { getTournament } from "@/data/tournaments";
import { imageForSlug } from "@/data/imagery";
import { MATCHES } from "@/data/matches";
import { Badge } from "@/components/ui/primitives";
import { MatchCard } from "@/components/ui/cards";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

const TABS = ["OVERVIEW", "SCHEDULE", "STANDINGS", "RESULTS"] as const;

export function TournamentDetail({ slug }: { slug: string }) {
  const t = getTournament(slug);
  const [tab, setTab] = useState<(typeof TABS)[number]>("OVERVIEW");
  if (!t) return <div className="mx-auto max-w-[1400px] px-5 py-40 text-center text-white/50">Tournament not found.</div>;
  const related = MATCHES.filter((m) => m.tournamentSlug === t.slug);
  const upcoming = related.filter((m) => m.status === "upcoming");
  const results = related.filter((m) => m.status === "completed");

  return (
    <>
      <div className="grain relative overflow-hidden border-b border-white/8">
        <img
          src={imageForSlug(t.slug)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.62) 0%, rgba(7,9,13,0.45) 40%, #07090D 96%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 pt-36 md:pt-52 pb-10">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{t.status}</Badge>
            <Badge>{t.stage}</Badge>
            {t.prizePool && <Badge>{t.prizePool}</Badge>}
          </div>
          <h1 className="font-display mt-4 text-5xl md:text-8xl font-bold tracking-tight">{t.name}</h1>
          <p className="mt-3 text-white/60">
            {formatDate(t.date)}{t.endDate ? ` → ${formatDate(t.endDate)}` : ""}{t.venue ? ` · ${t.venue}` : ""}{t.format ? ` · ${t.format}` : ""}
          </p>
        </div>
      </div>
      <div className="sticky top-16 md:top-20 z-30 border-b border-white/8 bg-[#07090D]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 md:px-10" role="tablist" aria-label="Tournament sections">
          {TABS.map((tb) => (
            <button
              key={tb}
              role="tab"
              aria-selected={tab === tb}
              onClick={() => setTab(tb)}
              className={cn(
                "shrink-0 px-5 py-4 text-[12px] font-bold tracking-[0.18em] cursor-pointer border-b-2 transition-colors",
                tab === tb ? "border-[var(--accent)] text-white" : "border-transparent text-white/45 hover:text-white",
              )}
            >
              {tb}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 min-h-[40vh]">
        {tab === "OVERVIEW" && (
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-lg leading-relaxed text-white/75">{t.description}</p>
              {t.journey && (
                <ol className="mt-8 space-y-4">
                  {t.journey.map((j) => (
                    <li key={j.title} className="border-l-2 border-[var(--accent)] pl-5">
                      <p className="font-display text-lg font-bold">{j.title}</p>
                      <p className="text-white/60">{j.text}</p>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                {[
                  ["PLACEMENT", t.placement ?? "—"],
                  ["MVP", t.mvp ?? "—"],
                  ["SQUAD", t.teamSlugs.join(", ").toUpperCase()],
                  ["FORMAT", t.format ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="border border-white/8 bg-[#0C0F16] p-4">
                    <p className="label !text-[10px] text-white/35">{k}</p>
                    <p className="mt-1 font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <aside className="border border-white/8 bg-[#0C0F16] p-6 h-fit">
              <p className="label text-white/40">Organization journey</p>
              <p className="mt-2 text-sm text-white/60">Follow every {t.name} fixture involving our squads.</p>
              <div className="mt-4 border-t border-white/8">
                {related.length ? related.map((m) => <MatchCard key={m.id} match={m} />) : <p className="py-4 text-white/45 text-sm">Fixtures TBA.</p>}
              </div>
            </aside>
          </div>
        )}
        {tab === "SCHEDULE" && (
          <div className="border-t border-white/8">
            {upcoming.length ? upcoming.map((m) => <MatchCard key={m.id} match={m} />) : <p className="py-6 text-white/45">No upcoming fixtures. Check results.</p>}
          </div>
        )}
        {tab === "STANDINGS" && (
          t.standings ? (
            <div className="overflow-x-auto border border-white/8">
              <table className="w-full min-w-[480px] text-sm">
                <thead><tr className="border-b border-white/8 text-left text-[11px] tracking-[0.18em] uppercase text-white/40"><th className="px-5 py-3">Team</th><th className="px-5 py-3">W</th><th className="px-5 py-3">L</th></tr></thead>
                <tbody>
                  {t.standings.map((s) => (
                    <tr key={s.team} className="border-b border-white/5 last:border-0"><td className="px-5 py-3 font-bold">{s.team}</td><td className="px-5 py-3 tabular-nums">{s.w}</td><td className="px-5 py-3 tabular-nums">{s.l}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="py-6 text-white/45">Standings not published yet.</p>
        )}
        {tab === "RESULTS" && (
          <div className="border-t border-white/8">
            {results.length ? results.map((m) => <MatchCard key={m.id} match={m} />) : <p className="py-6 text-white/45">No results yet.</p>}
          </div>
        )}
        <p className="mt-10">
          <Link href="/tournaments" className="text-xs font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white border-b border-white/20 pb-1">← All tournaments</Link>
        </p>
      </div>
    </>
  );
}
