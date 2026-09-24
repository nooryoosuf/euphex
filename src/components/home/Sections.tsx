import { TEAMS } from "@/data/teams";
import { getTeamPlayers } from "@/data/players";
import { TeamCard } from "@/components/ui/cards";
import { SectionHeader } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { TOURNAMENTS } from "@/data/tournaments";
import { TournamentCard, MatchCard } from "@/components/ui/cards";
import { completedMatches } from "@/data/matches";
import { TIMELINE } from "@/data/content";
import { CountUp } from "@/components/ui/CountUp";

export function Squads() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-32" aria-label="Squads">
      <SectionHeader index="02" label="The organization" title="TWO SQUADS. ONE STANDARD." href="/teams" linkLabel="All teams" />
      <div className="grid gap-5 md:grid-cols-2">
        {TEAMS.map((t) => (
          <TeamCard key={t.slug} team={t} />
        ))}
      </div>
      {/* org totals strip */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-white/8 py-8">
        {[
          { v: <CountUp to={105} />, l: "Matches played" },
          { v: <CountUp to={71} suffix="%" />, l: "Org win rate" },
          { v: <CountUp to={8} />, l: "Players" },
          { v: <CountUp to={4} />, l: "Trophies" },
        ].map((s, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <p className="font-display text-4xl md:text-5xl font-bold tabular-nums">{s.v}</p>
            <p className="label mt-2 text-white/40">{s.l}</p>
          </Reveal>
        ))}
      </div>
      <div className="sr-only">
        {TEAMS.map((t) => (
          <p key={t.slug}>
            {t.name}: {getTeamPlayers(t.slug).length} players
          </p>
        ))}
      </div>
    </section>
  );
}

export function CompetingNext() {
  const list = TOURNAMENTS.filter((t) => t.status !== "COMPLETED").slice(0, 3);
  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28" aria-label="Upcoming tournaments">
      <SectionHeader index="01" label="Calendars" title="COMPETING NEXT." href="/tournaments" linkLabel="All tournaments" />
      <div className="grid gap-5 lg:grid-cols-2">
        {list[0] && <TournamentCard t={list[0]} index={0} />}
        <div className="grid gap-5">
          {list.slice(1).map((t) => (
            <TournamentCard key={t.slug} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Results() {
  const recent = completedMatches().slice(0, 4);
  return (
    <section className="border-y border-white/8 bg-[#090C12]" aria-label="Recent results">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28">
        <SectionHeader index="03" label="Form" title="RESULTS." href="/matches" linkLabel="All matches" />
        <div className="border-t border-white/8">
          {recent.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function History() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-32" aria-label="Organization history">
      <SectionHeader index="04" label="Since 2023" title="THE STORY SO FAR." href="/about" linkLabel="About us" />
      <ol className="grid gap-px overflow-hidden border border-white/8 bg-white/8 md:grid-cols-4">
        {TIMELINE.map((e, i) => (
          <Reveal key={e.year} delay={i * 0.07} className="bg-[#0C0F16]">
            <li className="group h-full p-7 md:p-9 hover:bg-[#11141D] transition-colors">
              <p className="font-display text-5xl md:text-6xl font-bold text-white/15 group-hover:text-[var(--accent)] transition-colors">{e.year}</p>
              <p className="font-display mt-5 text-xl font-bold tracking-tight">{e.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{e.text}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
