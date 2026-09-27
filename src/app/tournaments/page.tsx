import { TOURNAMENTS } from "@/data/tournaments";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { TournamentCard } from "@/components/ui/cards";

export default function TournamentsPage() {
  // latest completed campaign always on top
  const list = [...TOURNAMENTS].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <>
      <PageHero index="04" label="Compete" title="TOURNAMENTS." sub="Every bracket we enter — upcoming campaigns and the trophies behind us." image={SECTION_BG.tournaments} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16 grid gap-5 md:grid-cols-2">
        {list.map((t, i) => (
          <TournamentCard key={t.slug} t={t} index={i} />
        ))}
      </div>
    </>
  );
}
