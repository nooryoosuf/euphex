"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Player } from "@/data/types";
import { Artwork } from "@/components/ui/Artwork";
import { imageForHero } from "@/data/imagery";
import { cn } from "@/lib/utils";

export function HeroPoolBlock({ player }: { player: Player }) {
  const [active, setActive] = useState(player.heroPool[0]?.slug);
  const hero = player.heroPool.find((h) => h.slug === active) ?? player.heroPool[0];
  const stageSrc = imageForHero(hero.name);
  const cats = [
    ["SIGNATURE", player.heroPool.filter((h) => h.category === "signature")],
    ["COMFORT", player.heroPool.filter((h) => h.category === "comfort")],
    ["POCKET PICK", player.heroPool.filter((h) => h.category === "pocket")],
  ] as const;
  return (
    <div>
      <div className="grain relative overflow-hidden border border-white/8">
        <motion.div
          key={hero.slug}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {stageSrc ? (
            <img
              src={stageSrc}
              alt={hero.name}
              className="aspect-[16/7] w-full object-cover object-[center_20%]"
            />
          ) : (
            <Artwork hue={hero.art.hue} label={hero.art.label} className="aspect-[16/7] w-full" />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.35) 0%, rgba(7,9,13,0.25) 40%, rgba(0,0,0,0.88) 100%)" }}
            aria-hidden="true"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 p-6 md:p-10">
          <p className="label text-[var(--accent)]">Hero pool — {hero.category.toUpperCase()}</p>
          <h3 className="font-display text-4xl md:text-7xl font-bold tracking-tight">{hero.name.toUpperCase()}</h3>
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
            key={h.slug}
            role="tab"
            aria-selected={h.slug === active}
            onClick={() => setActive(h.slug)}
            onMouseEnter={() => setActive(h.slug)}
            onFocus={() => setActive(h.slug)}
            className={cn(
              "shrink-0 cursor-pointer overflow-hidden border transition-all",
              h.slug === active ? "border-[var(--accent)]" : "border-white/10 opacity-60 hover:opacity-100",
            )}
          >
            <Artwork hue={h.art.hue} label={h.art.label} className="aspect-square w-full" />
            <span className="block bg-black/80 px-1 py-1.5 text-[10px] font-bold tracking-[0.1em] text-center">
              {h.name.toUpperCase()}
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
                <li key={h.slug}>
                  <button
                    onClick={() => setActive(h.slug)}
                    className="font-display text-xl font-bold hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    {h.name.toUpperCase()}
                  </button>
                  <div className="mt-1 h-1 bg-white/10" role="img" aria-label={`${h.name} ${h.games} matches, ${h.winRate}% win rate`}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${h.winRate}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-[var(--accent)]"
                    />
                  </div>
                  <p className="mt-1 text-xs text-white/45 tabular-nums">
                    {h.games} matches · {h.winRate}% win
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
