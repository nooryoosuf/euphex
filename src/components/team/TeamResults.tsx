"use client";
import { useState } from "react";
import type { Match } from "@/data/types";
import { MatchCard } from "@/components/ui/cards";

const PAGE = 10;

export function TeamResults({ results }: { results: Match[] }) {
  const [expanded, setExpanded] = useState(false);
  if (results.length === 0) return <p className="py-6 text-white/45">No results yet.</p>;
  const shown = expanded ? results : results.slice(0, PAGE);
  return (
    <>
      <div className="border-t border-white/8">
        {shown.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
      {results.length > PAGE && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-5 w-full border border-white/12 py-3.5 text-[12px] font-bold tracking-[0.18em] uppercase text-white/70 hover:text-white hover:border-[var(--accent)] cursor-pointer transition-colors"
        >
          {expanded ? "Show less" : `Load more (${results.length - PAGE} more)`}
        </button>
      )}
    </>
  );
}
