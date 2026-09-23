"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { OrgMark } from "@/components/ui/Artwork";
import { cn } from "@/lib/utils";

const LINKS = [
  ...siteConfig.nav.compete,
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled ? "bg-[#07090D]/85 backdrop-blur-md border-b border-white/8" : "bg-transparent",
        )}
      >
        <nav aria-label="Primary" className="mx-auto flex h-16 md:h-20 max-w-[1400px] items-center justify-between px-5 md:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="Euphex home">
            <OrgMark className="size-8 text-white" />
            <span className="font-display text-lg font-bold tracking-tight">
              EUPHEX
              <span className="ml-2 hidden sm:inline text-[10px] font-semibold tracking-[0.28em] text-white/40">ESPORTS</span>
            </span>
          </Link>
          <ul className="hidden lg:flex items-center gap-8">
            {LINKS.slice(0, 6).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "group relative text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors",
                    pathname === l.href || pathname.startsWith(l.href + "/") ? "text-white" : "text-white/55 hover:text-white",
                  )}
                >
                  {l.label}
                  <span
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-[2px] bg-[var(--accent)] transition-all duration-300",
                      pathname === l.href ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <Link
              href="/community"
              className="hidden md:inline-flex items-center border border-white/15 px-5 py-2.5 text-[12px] font-bold tracking-[0.18em] uppercase hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
            >
              Community
            </Link>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex size-10 items-center justify-center border border-white/15 hover:border-[var(--accent)] transition-colors"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#07090D]/97 backdrop-blur-xl"
          >
            <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 md:px-10 pt-20">
              <p className="label text-white/35 mb-6">Menu</p>
              <ul className="space-y-1">
                {[...siteConfig.nav.compete, ...siteConfig.nav.community, { label: "About", href: "/about" }].map((l, i) => (
                  <motion.li
                    key={l.href + l.label}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.45 }}
                  >
                    <Link
                      href={l.href}
                      onClick={close}
                      className="font-display group flex items-baseline gap-4 py-2 text-4xl md:text-6xl font-bold tracking-tight text-white/85 hover:text-white transition-colors"
                    >
                      <span className="text-sm text-[var(--accent)] font-semibold">0{i + 1}</span>
                      <span className="group-hover:translate-x-2 transition-transform duration-300">{l.label.toUpperCase()}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <p className="label mt-10 text-white/30">Play hard. Play together.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
