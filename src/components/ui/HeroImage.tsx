"use client";
import { useState } from "react";
import { getMlbbHero, mlbbHeroImage } from "@/data/mlbb";
import { HEROES } from "@/data/heroes";
import { Artwork } from "./Artwork";
import { cn } from "@/lib/utils";

/**
 * Reusable hero artwork component — reference by hero ID only.
 *
 *   <HeroImage hero="chou" />
 *
 * Resolution order: registry artwork → generated gradient placeholder.
 * Missing assets never break layout: exactly one element always renders.
 */
export function HeroImage({
  hero,
  skin,
  alt,
  className,
  eager = false,
}: {
  hero: string;
  skin?: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const key = hero.toLowerCase().replace(/[^a-z0-9]/g, "");
  const src = failed ? null : mlbbHeroImage(hero, skin);
  const meta = getMlbbHero(hero);
  const fallback = (HEROES as Record<string, { hue: number; label: string }>)[key];

  if (!src) {
    return (
      <Artwork
        hue={fallback?.hue ?? 220}
        label={fallback?.label ?? (meta?.name ?? hero).slice(0, 2).toUpperCase()}
        className={cn(className)}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt ?? meta?.name ?? hero}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={cn("block", className)}
    />
  );
}
