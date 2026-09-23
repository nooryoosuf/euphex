"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { completedMatches, nextMatch } from "@/data/matches";
import { getTeam } from "@/data/teams";
import { formatDate } from "@/lib/utils";
import { Countdown } from "@/components/ui/Countdown";
import { Badge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

/** MATCHDAY MODE — driven by match data: shows countdown pre-match,
 *  and auto-flips to FINAL RESULT once the latest completed match is newer. */
export function Matchday() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const upcoming = nextMatch();
  const last = completedMatches()[0];
  const upcomingTime = upcoming ? +new Date(upcoming.date) : Infinity;
  const lastTime = last ? +new Date(last.date) : 0;
  const showResult =
    !upcoming || (lastTime > now - 1000 * 60 * 60 * 6 && upcomingTime > now + 1000 * 60 * 60 * 20);

  if (showResult && last) {
    const team = getTeam(last.teamSlug);
    return (
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 -mt-2" aria-label="Latest result">
        <Reveal>
          <div className="grain relative overflow-hidden border border-white/8 bg-[#0C0F16] p-8 md:p-14">
            <div className="absolute inset-0" style={{ background: "radial-gradient(70% 100% at 50% 0%, rgba(52,211,153,0.12), transparent 60%)" }} />
            <p className="label relative text-white/40">Final result — {last.tournamentName} · {last.stage}</p>
            <div className="relative mt-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
              <p className="font-display text-5xl md:text-8xl font-bold tracking-tight">
                {last.scoreUs} <span className="text-white/25">—</span> {last.scoreThem}
              </p>
              <div>
                <Badge tone={last.result === "WIN" ? "win" : last.result === "LOSS" ? "loss" : "draw"}>
                  {last.result === "WIN" ? "Victory" : last.result}
                </Badge>
                <p className="mt-2 text-lg text-white/70">
                  {team?.shortName} vs {last.opponent}
                </p>
                <Link href={`/matches/${last.id}`} className="mt-3 inline-block border-b border-[var(--accent)] pb-0.5 text-sm font-bold tracking-[0.14em] uppercase hover:text-white text-white/80">
                  Match report
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    );
  }

  if (!upcoming) {
    return (
      <section className="mx-auto max-w-[1400px] px-5 md:px-10" aria-label="Next match">
        <Reveal>
          <div className="border border-white/8 bg-[#0C0F16] p-8 md:p-12 text-center">
            <p className="label text-white/40">Next match</p>
            <p className="font-display mt-3 text-3xl font-bold">NO UPCOMING MATCHES</p>
            <p className="mt-2 text-white/55">The next tournament will be announced soon.</p>
          </div>
        </Reveal>
      </section>
    );
  }

  const team = getTeam(upcoming.teamSlug);
  const isToday = new Date(upcoming.date).toDateString() === new Date().toDateString();
  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10" aria-label="Next match">
      <Reveal>
        <div className="grain relative overflow-hidden border border-white/8 bg-[#0C0F16]">
          <div className="absolute inset-0" style={{ background: "radial-gradient(80% 120% at 100% 0%, rgba(227,37,107,0.22), transparent 55%)" }} />
          {isToday && (
            <p className="absolute top-5 right-6 md:top-8 md:right-10 flex items-center gap-2 text-[12px] font-bold tracking-[0.22em] text-red-400">
              <span className="relative flex size-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-red-400" /></span>
              MATCHDAY
            </p>
          )}
          <div className="relative grid gap-10 p-8 md:p-14 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <div>
              <p className="label text-[var(--accent)]">Next match — {upcoming.tournamentName} · {upcoming.stage}</p>
              <h2 className="font-display mt-4 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight">
                {team?.shortName} <span className="text-white/25">VS</span> {upcoming.opponentShort}
              </h2>
              <p className="mt-3 text-sm md:text-base text-white/55">
                {team?.name} vs {upcoming.opponent} — {formatDate(upcoming.date)}
                {upcoming.venue ? ` · ${upcoming.venue}` : ""} {isToday ? "· TONIGHT" : ""}
              </p>
              <div className="mt-7">
                <Countdown targetIso={upcoming.date} />
              </div>
              <Link
                href={`/matches/${upcoming.id}`}
                className="mt-8 inline-flex items-center gap-2 bg-[var(--accent)] px-7 py-3.5 text-[13px] font-bold tracking-[0.14em] uppercase clip-slant hover:brightness-110 transition-all"
              >
                View match
              </Link>
            </div>
            <div className="hidden lg:block text-right" aria-hidden="true">
              <p className="font-display text-[10rem] leading-none font-bold text-white/6">{team?.shortName.slice(0, 2)}</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
