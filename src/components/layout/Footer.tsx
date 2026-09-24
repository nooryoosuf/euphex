"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { EuphexLogo } from "@/components/ui/TeamLogos";

const SECRET_KEY = "euphex-logo-taps";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const onLogoClick = () => {
    try {
      const n = Number(sessionStorage.getItem(SECRET_KEY) ?? "0") + 1;
      sessionStorage.setItem(SECRET_KEY, String(n));
      if (n === 7) {
        window.dispatchEvent(new CustomEvent("euphex:easter", { detail: "Click the roam ward 3 times on /media. — dev" }));
        alert("SECRET MODE UNLOCKED — THE ROASTER nods at you. Check /roast. (dev joke #007)");
        sessionStorage.setItem(SECRET_KEY, "0");
      }
    } catch {
      /* noop */
    }
  };

  return (
    <footer className="border-t border-white/8 bg-[#05070B]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <button onClick={onLogoClick} aria-label="Euphex logo (psst… tap 7 times)" className="flex items-center gap-3 cursor-pointer">
              <EuphexLogo className="size-10 text-white" />
              <span className="font-display text-2xl font-bold">EUPHEX</span>
            </button>
            <p className="label mt-5 text-[var(--accent)]">{siteConfig.org.tagline}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              {siteConfig.org.fullName} — {siteConfig.org.game}. Two squads. One standard.
            </p>
          </div>
          <nav aria-label="Compete">
            <p className="label text-white/35 mb-5">Compete</p>
            <ul className="space-y-3 text-sm text-white/60">
              {siteConfig.nav.compete.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Community and socials">
            <p className="label text-white/35 mb-5">Community</p>
            <ul className="space-y-3 text-sm text-white/60">
              {siteConfig.nav.community.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.entries(siteConfig.socials).map(([k, href]) => (
                <a
                  key={k}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-white/55 hover:text-white hover:border-[var(--accent)] transition-colors"
                >
                  {k}
                </a>
              ))}
            </div>
          </nav>
        </div>
        <div className="mt-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-white/8 pt-6 text-xs text-white/35">
          <p>© 2026 {siteConfig.org.fullName}. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase">Built for the fight.</p>
        </div>
      </div>
    </footer>
  );
}
