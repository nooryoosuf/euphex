"use client";
import Link from "next/link";
import { useContent } from "@/components/content";
import { PageHero } from "@/components/ui/PageHero";
import { TEAM_BG } from "@/data/imagery";
import { TeamLogo } from "@/components/ui/TeamLogos";
import { PlayerCard, MatchCard } from "@/components/ui/cards";
import { TeamResults } from "@/components/team/TeamResults";
import { Badge, Stat } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

export function TeamView({ slug }: { slug: string }) {
  const { getTeam, getTeamPlayers, matches: MATCHES } = useContent();
  const team = getTeam(slug);
  if (!team) {
    return <div className="mx-auto max-w-[1400px] px-5 py-40 text-center text-white/50">Team not found.</div>;
  }
  const roster = getTeamPlayers(slug);
  const teamMatches = MATCHES.filter((m) => m.teamSlug === slug);
  const upcoming = teamMatches.filter((m) => m.status === "upcoming");
  const results = teamMatches.filter((m) => m.status === "completed");
  // stats computed live from real results — no stats shown without a record
  const w = results.filter((m) => m.result === "WIN").length;
  const l = results.filter((m) => m.result === "LOSS").length;
  const d = results.filter((m) => m.result === "DRAW").length;
  const showStats = results.length > 0;
  const winRate = results.length ? Math.round((w / results.length) * 100) : 0;

  return (
    <>
      <PageHero index={team.index} label={`${team.tier} — ${team.verb}`} title={team.name} sub={team.description} image={TEAM_BG[slug] ?? TEAM_BG.euphex} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16">
        <div className="flex items-center gap-5">
          <TeamLogo slug={team.slug} className="h-16 md:h-20 w-auto text-white" />
          <p className="max-w-md text-sm md:text-base leading-relaxed text-white/55">{team.tagline}</p>
        </div>
        {showStats && (
          <div className="mt-8 grid gap-8 md:grid-cols-4">
            <Stat value={<CountUp to={w} />} label={`${w}–${l}${d ? `–${d}` : ""} record`} />
            <Stat value={<CountUp to={winRate} suffix="%" />} label="Win rate" />
            <Stat value={<CountUp to={roster.length} />} label="Players" />
            <Stat value={<CountUp to={team.championships} />} label="Championships" />
          </div>
        )}

        {/* playstyle */}
        <section className="mt-16 md:mt-24" aria-label="Playstyle">
          <p className="label text-white/40">Our playstyle</p>
          <Reveal>
            <h2 className="font-display mt-4 text-4xl md:text-7xl font-bold leading-[0.95] tracking-tight">
              {team.playstyle.map((w, i) => (
                <span key={w} className={i === 1 ? "text-white/30" : ""}>
                  {w}
                  <br />
                </span>
              ))}
            </h2>
          </Reveal>
        </section>

        {/* roster */}
        <section className="mt-16 md:mt-24" aria-label="Roster">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">ROSTER.</h2>
            <Link href="/players" className="text-xs font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white border-b border-white/20 pb-1">
              All players
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {roster.map((p, i) => (
              <PlayerCard key={p.slug} player={p} index={i} />
            ))}
          </div>
        </section>

        {/* matches */}
        <div className="mt-16 md:mt-24 grid gap-12 lg:grid-cols-2">
          <section aria-label="Upcoming">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">UPCOMING.</h2>
            <div className="mt-4 border-t border-white/8">
              {upcoming.length ? upcoming.map((m) => <MatchCard key={m.id} match={m} />) : <p className="py-6 text-white/45">No upcoming matches. Next tournament soon.</p>}
            </div>
          </section>
          <section aria-label="Results">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">RESULTS.</h2>
            <div className="mt-4">
              <TeamResults results={results} />
            </div>
          </section>
        </div>

        {/* achievements */}
        <section className="mt-16 md:mt-24" aria-label="Achievements">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">ACHIEVEMENTS.</h2>
          {team.achievements.length ? (
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {team.achievements.map((a, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <li className="border border-white/8 bg-[#0C0F16] p-6">
                  <Badge tone={a.kind === "Champion" || a.kind === "MVP" ? "accent" : "default"}>{a.kind}</Badge>
                  <p className="font-display mt-3 text-2xl font-bold">{a.event}</p>
                  <p className="text-sm text-white/50">{a.title} · {a.year}</p>
                </li>
              </Reveal>
            ))}
            </ol>
          ) : (
            <p className="mt-6 border border-dashed border-white/12 bg-white/[0.02] p-8 text-center text-white/45">
              No achievements yet — the story is still being written.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
