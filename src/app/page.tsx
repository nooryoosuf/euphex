import { Hero, Ticker } from "@/components/home/Hero";
import { Matchday } from "@/components/home/Matchday";
import { CompetingNext, Results, Squads, History } from "@/components/home/Sections";
import { SectionHeader, Button } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { NEWS } from "@/data/content";
import { NewsCard } from "@/components/ui/cards";
import { CommunityMosaic } from "@/components/home/CommunityMosaic";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker items={["RASHU CUP — GROUP STAGE", "SEP 28 — EUPHEX VS NOVA", "TWO SQUADS", "ONE STANDARD", "PLAY HARD. PLAY TOGETHER."]} />
      <div className="pt-14 md:pt-20">
        <Matchday />
      </div>
      <CompetingNext />
      <Results />
      <Squads />
      {/* Community teaser — editorial split, not a card */}
      <section className="border-y border-white/8 bg-[#090C12]" aria-label="Community">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 md:px-10 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="label text-[var(--accent)]">05 — Community</p>
            <h2 className="font-display mt-3 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight">
              SERIOUS GAME.
              <br />
              NOT-SERIOUS WEBSITE.
            </h2>
            <p className="mt-5 max-w-md text-white/60 leading-relaxed">
              Get roasted by the roster, find your hero, rate your main, and vote on who&apos;s actually throwing the Lord.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/roast">Roast me</Button>
              <Button href="/community" variant="ghost">
                Enter fan zone
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CommunityMosaic />
          </Reveal>
        </div>
      </section>
      {/* Latest news — editorial */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-20 md:py-28" aria-label="Latest news">
        <SectionHeader index="06" label="Wire" title="LATEST." href="/news" linkLabel="All news" />
        <div className="grid gap-5 md:grid-cols-3">
          {NEWS.slice(0, 3).map((a) => (
            <NewsCard key={a.slug} a={a} />
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href="/media" className="text-sm font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white border-b border-white/20 pb-1">
            Browse media gallery
          </Link>
        </p>
      </section>
      <History />
    </>
  );
}
