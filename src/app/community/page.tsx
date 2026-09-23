import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { Reveal } from "@/components/ui/Reveal";

const CARDS = [
  { href: "/roast", title: "ROAST THE ROSTER", sub: "Think you can survive our players?", tag: "01 — Interactive" },
  { href: "/find-your-hero", title: "FIND YOUR HERO", sub: "Answer honestly. Get judged accurately.", tag: "02 — Quiz" },
  { href: "/rate-my-main", title: "RATE MY MAIN", sub: "Fake analysts. Real damage.", tag: "03 — Verdict" },
  { href: "/most-likely", title: "WHO'S MOST LIKELY TO…", sub: "Vote. Expose your favorite player.", tag: "04 — Voting" },
];

export default function CommunityPage() {
  return (
    <>
      <PageHero index="08" label="Fan zone" title="COMMUNITY." sub="The serious side plays to win. This side plays for laughs — all in good fun." image={SECTION_BG.community} />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16 grid gap-5 md:grid-cols-2">
        {CARDS.map((c, i) => (
          <Reveal key={c.href} delay={i * 0.06}>
            <Link
              href={c.href}
              className="group block border border-white/8 bg-[#0C0F16] p-8 md:p-12 hover:border-[var(--accent)]/60 transition-colors min-h-[240px] flex flex-col justify-between"
            >
              <p className="label text-[var(--accent)]">{c.tag}</p>
              <div>
                <h2 className="font-display mt-6 text-3xl md:text-5xl font-bold tracking-tight group-hover:translate-x-1 transition-transform">{c.title}</h2>
                <p className="mt-2 text-white/55">{c.sub}</p>
                <span className="mt-6 inline-block text-[12px] font-bold tracking-[0.18em] uppercase text-white/70 group-hover:text-white">
                  Enter →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
