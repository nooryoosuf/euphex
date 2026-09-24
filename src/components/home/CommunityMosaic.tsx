"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MEDIA } from "@/data/content";
import { COMMUNITY_ART } from "@/data/imagery";
import { cn } from "@/lib/utils";

/**
 * Breathing photo mosaic — pure pictures, no text.
 * Each frame zooms on an 8s sine-like loop, phase-offset by 2s so the
 * wave travels across the grid. Hovering a frame brings it forward
 * and lets the others recede.
 */
export function CommunityMosaic() {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState<number | null>(null);

  return (
    <div
      className="grid grid-cols-2 gap-4"
      aria-hidden="true"
      onMouseLeave={() => setHot(null)}
    >
      {MEDIA.slice(0, 4).map((m, i) => (
        <motion.figure
          key={m.id}
          onMouseEnter={() => setHot(i)}
          onFocus={() => setHot(i)}
          animate={
            reduce
              ? undefined
              : {
                  scale: hot === null ? 1 : hot === i ? 1.045 : 0.965,
                  opacity: hot === null || hot === i ? 1 : 0.55,
                }
          }
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden border transition-colors duration-500",
            hot === i ? "border-[var(--accent)]/70 z-10" : "border-white/8",
          )}
        >
          <motion.img
            src={COMMUNITY_ART[i % COMMUNITY_ART.length]}
            alt=""
            loading="lazy"
            animate={reduce ? undefined : { scale: [1, 1.14, 1] }}
            transition={
              reduce
                ? undefined
                : { duration: 8, repeat: Infinity, ease: "easeInOut", delay: i * 2 }
            }
            className="block aspect-square w-full object-cover object-[center_20%]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 55%, rgba(7,9,13,0.35) 100%)" }}
          />
        </motion.figure>
      ))}
    </div>
  );
}
