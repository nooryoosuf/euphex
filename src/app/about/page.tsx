import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { Stat } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { TIMELINE } from "@/data/content";
import { TEAMS } from "@/data/teams";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <>
      <PageHero
        index="07"
        label="Organization"
        title="BUILT FOR THE FIGHT."
        sub={siteConfig.org.description}
        image={SECTION_BG.about}
      />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16">
        <div className="grid gap-6 border-y border-white/8 py-8 md:grid-cols-4">
          <Stat value={<CountUp to={siteConfig.org.founded} />} label="Founded" />
          <Stat value={<CountUp to={3} />} label="Squads" />
          <Stat value={<CountUp to={15} />} label="Players" />
          <Stat value={<CountUp to={4} />} label="Trophies" />
        </div>

        <section className="mt-16 grid gap-10 lg:grid-cols-2" aria-label="Structure">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">ONE PYRAMID.</h2>
            <p className="mt-4 leading-relaxed text-white/65">
              Prime sets the standard. Academy chases it. Rising learns it. Players move up — never sideways —
              and every squad runs the same draft book, the same review habits, and the same rule: play hard, play together.
            </p>
          </Reveal>
          <div className="space-y-4">
            {TEAMS.map((t, i) => (
              <Reveal key={t.slug} delay={i * 0.07}>
                <Link href={`/teams/${t.slug}`} className="group flex items-center justify-between border border-white/8 bg-[#0C0F16] p-6 hover:border-[var(--accent)]/50 transition-colors">
                  <div>
                    <p className="label text-[var(--accent)]">{t.index} — {t.tier}</p>
                    <p className="font-display text-2xl font-bold">{t.name}</p>
                  </div>
                  <span className="font-display text-4xl font-bold text-white/15 group-hover:text-[var(--accent)] transition-colors">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-16 md:mt-24" aria-label="Timeline">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">TIMELINE.</h2>
          <ol className="mt-8 border-t border-white/8">
            {TIMELINE.map((e) => (
              <li key={e.year} className="grid gap-2 border-b border-white/8 py-7 md:grid-cols-[120px_1fr_1fr] md:items-baseline">
                <span className="font-display text-4xl font-bold text-[var(--accent)]">{e.year}</span>
                <span className="font-display text-xl font-bold">{e.title}</span>
                <span className="text-white/55">{e.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
