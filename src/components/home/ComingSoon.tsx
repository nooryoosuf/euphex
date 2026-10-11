"use client";
import { siteConfig } from "@/config/site";
import { IMAGES } from "@/data/imagery";
import { EuphexLogo } from "@/components/ui/TeamLogos";
import { Countdown } from "@/components/ui/Countdown";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Full-screen launch takeover. Enabled via siteConfig.launch —
 * set `enabled: false` to restore the normal homepage.
 */
export function ComingSoon() {
  const { date } = siteConfig.launch;
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden" aria-label="Coming soon">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={IMAGES.hirara}
          alt=""
          loading="eager"
          draggable={false}
          className="h-full w-full object-cover object-[center_20%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,9,13,0.72) 0%, rgba(7,9,13,0.55) 45%, rgba(7,9,13,0.94) 100%), radial-gradient(80% 60% at 50% 20%, rgba(227,37,107,0.22), transparent 60%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] px-5 md:px-10 py-28 text-center">
        <Reveal>
          <EuphexLogo className="mx-auto h-16 md:h-20 w-auto text-white" />
          <p className="label mt-6 text-[var(--accent)]">
            {siteConfig.org.fullName} — {siteConfig.org.game}
          </p>
          <h1 className="font-display mx-auto mt-4 max-w-4xl text-5xl md:text-8xl font-bold leading-[0.92] tracking-tight">
            SOMETHING IS
            <br />
            COMING<span className="text-[var(--accent)]">.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-white/60">
            Three players in. Two more squads loading. The new era of Euphex drops soon.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="mt-10 flex justify-center">
          <Countdown targetIso={date} />
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {Object.entries(siteConfig.socials).map(([k, href]) => (
              <a
                key={k}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="border border-white/15 px-5 py-2.5 text-[11px] font-bold tracking-[0.18em] uppercase text-white/65 hover:text-white hover:border-[var(--accent)] transition-colors"
              >
                {k}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
