import { NEWS } from "@/data/content";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { NewsCard } from "@/components/ui/cards";

export default function NewsPage() {
  // latest article always first
  const list = [...NEWS].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  return (
    <>
      <PageHero index="05" label="Wire" title="NEWS." sub="Roster moves, tournament draws, and community stories." image={SECTION_BG.news} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <NewsCard key={a.slug} a={a} />
        ))}
      </div>
    </>
  );
}
