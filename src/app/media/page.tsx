"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { MEDIA } from "@/data/content";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { Artwork } from "@/components/ui/Artwork";
import type { MediaCategory } from "@/data/types";
import { cn } from "@/lib/utils";

const FILTERS: ("ALL" | MediaCategory)[] = ["ALL", "MATCHDAY", "TEAM", "COMMUNITY", "BEHIND THE SCENES"];

export default function MediaPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const list = MEDIA.filter((m) => filter === "ALL" || m.category === filter);
  const active = MEDIA.find((m) => m.id === lightbox);

  return (
    <>
      <PageHero index="06" label="Gallery" title="MEDIA." sub="Matchday, bootcamp, and behind-the-scenes — click any frame to expand." image={SECTION_BG.media} />
      <div className="sticky top-16 md:top-20 z-30 border-b border-white/8 bg-[#07090D]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-5 md:px-10 py-3" role="tablist" aria-label="Media filter">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 px-4 py-2 text-[12px] font-bold tracking-[0.16em] uppercase cursor-pointer transition-all",
                filter === f ? "bg-[var(--accent)] text-white" : "border border-white/12 text-white/55 hover:text-white",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 columns-2 md:columns-3 gap-4 [&>*]:mb-4">
        {list.map((m) => (
          <button
            key={m.id}
            onClick={() => setLightbox(m.id)}
            className="group relative block w-full overflow-hidden border border-white/8 text-left cursor-pointer break-inside-avoid"
            aria-label={`Open ${m.title}`}
          >
            <Artwork hue={m.hue} label={m.title.slice(0, 2).toUpperCase()} className={cn("w-full transition-transform duration-500 group-hover:scale-[1.03]", m.tall ? "aspect-[3/4]" : "aspect-square")} />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-10">
              <span className="label !text-[10px] text-[var(--accent)]">{m.category}</span>
              <span className="font-display block text-lg font-bold">{m.title}</span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-5"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
          >
            <motion.figure
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl overflow-hidden border border-white/15 bg-[#0C0F16]"
              onClick={(e) => e.stopPropagation()}
            >
              <Artwork hue={active.hue} label={active.title.slice(0, 2).toUpperCase()} className="aspect-video w-full" />
              <figcaption className="flex items-center justify-between p-5">
                <div>
                  <p className="label !text-[10px] text-[var(--accent)]">{active.category}</p>
                  <p className="font-display text-2xl font-bold">{active.title}</p>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  aria-label="Close"
                  className="inline-flex size-10 items-center justify-center border border-white/15 hover:border-[var(--accent)] cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
