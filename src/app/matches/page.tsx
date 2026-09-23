import { MATCHES, completedMatches, upcomingMatches } from "@/data/matches";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { MatchCard } from "@/components/ui/cards";

export default function MatchesPage() {
  const upcoming = upcomingMatches();
  const results = completedMatches();
  return (
    <>
      <PageHero index="03" label="Compete" title="MATCHES." sub="Every series, every stage — upcoming fixtures and full results." image={SECTION_BG.matches} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16 grid gap-14 lg:grid-cols-2">
        <section aria-label="Upcoming matches">
          <h2 className="font-display text-3xl font-bold tracking-tight">UPCOMING.</h2>
          <div className="mt-4 border-t border-white/8">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
            {upcoming.length === 0 && <p className="py-6 text-white/45">NO UPCOMING MATCHES — next tournament soon.</p>}
          </div>
        </section>
        <section aria-label="Results">
          <h2 className="font-display text-3xl font-bold tracking-tight">RESULTS.</h2>
          <div className="mt-4 border-t border-white/8">
            {results.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      </div>
      <p className="sr-only">Total {MATCHES.length} matches tracked.</p>
    </>
  );
}
