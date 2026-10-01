// ─────────────────────────────────────────────────────────────
// Live content context. Pages prerender with bundled seeds at build;
// on mount the provider swaps in Supabase data when reachable.
// useContent() mirrors the old @/data/* module API (arrays + getters)
// so migrated components barely change shape.
// ─────────────────────────────────────────────────────────────
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  Match, MediaItem, NewsArticle, Player, Team, TimelineEvent, Tournament,
} from "@/data/types";
import { fetchLiveContent, seedBundle, type ContentBundle } from "@/lib/supabase";

interface ContentValue extends ContentBundle {
  /** true once Supabase data replaced the seed bundle */
  live: boolean;
  getTeam: (slug: string) => Team | undefined;
  getPlayer: (slug: string) => Player | undefined;
  getTeamPlayers: (teamSlug: string) => Player[];
  getMatch: (id: string) => Match | undefined;
  getTournament: (slug: string) => Tournament | undefined;
  getArticle: (slug: string) => NewsArticle | undefined;
  upcomingMatches: () => Match[];
  completedMatches: () => Match[];
  nextMatch: () => Match | undefined;
}

const byDateAsc = (a: Match, b: Match) => +new Date(a.date) - +new Date(b.date);
const byDateDesc = (a: Match, b: Match) => +new Date(b.date) - +new Date(a.date);

const Ctx = createContext<ContentValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [bundle, setBundle] = useState<ContentBundle>(seedBundle);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let dead = false;
    fetchLiveContent().then((b) => {
      if (!dead && b) {
        setBundle(b);
        setLive(true);
      }
    });
    return () => { dead = true; };
  }, []);

  const value = useMemo<ContentValue>(() => {
    const upcomingMatches = () =>
      bundle.matches.filter((m) => m.status === "upcoming").sort(byDateAsc);
    return {
      ...bundle,
      live,
      getTeam: (slug) => bundle.teams.find((t) => t.slug === slug),
      getPlayer: (slug) => bundle.players.find((p) => p.slug === slug),
      getTeamPlayers: (teamSlug) => bundle.players.filter((p) => p.teamSlug === teamSlug),
      getMatch: (id) => bundle.matches.find((m) => m.id === id),
      getTournament: (slug) => bundle.tournaments.find((t) => t.slug === slug),
      getArticle: (slug) => bundle.news.find((n) => n.slug === slug),
      upcomingMatches,
      completedMatches: () =>
        bundle.matches.filter((m) => m.status === "completed").sort(byDateDesc),
      nextMatch: () => upcomingMatches()[0],
    };
  }, [bundle, live]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent(): ContentValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useContent must be used inside <ContentProvider>");
  return v;
}

// Re-export types for convenience
export type { Match, MediaItem, NewsArticle, Player, Team, TimelineEvent, Tournament };
