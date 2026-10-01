"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Player } from "@/data/types";
import { HEROES } from "@/data/heroes";
import { getMlbbHero } from "@/data/mlbb";
import { HeroImage } from "@/components/ui/HeroImage";
import { cn } from "@/lib/utils";

const heroName = (id: string) => getMlbbHero(id)?.name ?? id;
const heroLane = (id: string) => HEROES[id]?.lane ?? "Multi";

export function HeroPoolBlock({ player }: { player: Player }) {
  const keyOf = (h: { hero: string; skin?: string }) => `${h.hero}:${h.skin ?? "default"}`;
  const [active, setActive] = useState(player.heroPool[0] ? keyOf(player.heroPool[0]) : "");
  const hero = player.heroPool.find((h) => keyOf(h) === active) ?? player.heroPool[0];
  if (!hero) return null;
  const name = heroName(hero.hero);
  const cats = [
    ["SIGNATURE", player.heroPool.filter((h) => h.category === "signature")],
    ["COMFORT", player.heroPool.filter((h) => h.category === "comfort")],
    ["POCKET PICK", player.heroPool.filter((h) => h.category === "pocket")],
  ] as const;
  return (
    <div>
      <div className="grain relative overflow-hidden border border-white/8">
        <motion.div
          key={keyOf(hero)}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <HeroImage
            hero={hero.hero}
            skin={hero.skin}
            alt={name}
            eager
            className="aspect-[16/7] w-full object-cover object-[center_20%]"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.35) 0%, rgba(7,9,13,0.25) 40%, rgba(0,0,0,0.88) 100%)" }}
            aria-hidden="true"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 p-6 md:p-10">
          <p className="label text-[var(--accent)]">Hero pool — {hero.category.toUpperCase()}</p>
          <h3 className="font-display text-4xl md:text-7xl font-bold tracking-tight">{name.toUpperCase()}</h3>
          <div className="mt-3 flex flex-wrap gap-6">
            <p className="font-display text-xl md:text-2xl font-bold tabular-nums">
              {hero.games} <span className="text-sm font-semibold text-white/50">MATCHES</span>
            </p>
            <p className="font-display text-xl md:text-2xl font-bold tabular-nums">
              {hero.winRate}% <span className="text-sm font-semibold text-white/50">WIN</span>
            </p>
            {hero.kda && (
              <p className="font-display text-xl md:text-2xl font-bold tabular-nums">
                {hero.kda} <span className="text-sm font-semibold text-white/50">KDA</span>
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Hero pool">
        {player.heroPool.map((h) => (
          <button
            key={keyOf(h)}
            role="tab"
            aria-selected={keyOf(h) === active}
            onClick={() => setActive(keyOf(h))}
            onMouseEnter={() => setActive(keyOf(h))}
            onFocus={() => setActive(keyOf(h))}
            className={cn(
              "w-24 md:w-28 shrink-0 cursor-pointer overflow-hidden border transition-all",
              keyOf(h) === active ? "border-[var(--accent)]" : "border-white/10 opacity-60 hover:opacity-100",
            )}
          >
            <span className="relative block aspect-square w-full overflow-hidden">
              <HeroImage hero={h.hero} skin={h.skin} className="absolute inset-0 h-full w-full object-cover" />
            </span>
            <span className="flex h-7 items-center justify-center bg-black/80 px-1 text-[10px] font-bold tracking-[0.1em] text-center leading-none truncate">
              {heroName(h.hero).toUpperCase()}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {cats.map(([label, list]) => (
          <div key={label} className="border-t border-white/10 pt-4">
            <p className="label text-[var(--accent)]">{label}</p>
            <ul className="mt-3 space-y-4">
              {list.map((h) => (
                <li key={keyOf(h)}>
                  <button
                    onClick={() => setActive(keyOf(h))}
                    className="font-display text-xl font-bold hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    {heroName(h.hero).toUpperCase()}
                  </button>
                  <p className="mt-0.5 text-[11px] tracking-[0.14em] uppercase text-white/35">{heroLane(h.hero)}</p>
                  <div className="mt-1 h-1 bg-white/10" role="img" aria-label={`${heroName(h.hero)} ${h.games} matches, ${h.winRate}% win rate`}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${h.winRate}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-[var(--accent)]"
                    />
                  </div>
                  <p className="mt-1 text-xs text-white/45 tabular-nums">
                    {h.games} matches · {h.winRate}% win{h.power ? ` · ⚡${h.power.toLocaleString()} power` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
