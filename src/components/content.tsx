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

// Canonical lane order: EXP → Jungle → Mid → Gold → Roam
const ROLE_ORDER = ["EXP Lane", "Jungle", "Mid Lane", "Gold Lane", "Roam"];

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
    // Player order everywhere: Euphex squad first → Aurex last (team order),
    // then lane order (EXP → Jungle → Mid → Gold → Roam), then name.
    const teamIdx = new Map(bundle.teams.map((t, i) => [t.slug, i]));
    const players = [...bundle.players].sort((a, b) => {
      const dt = (teamIdx.get(a.teamSlug) ?? 99) - (teamIdx.get(b.teamSlug) ?? 99);
      if (dt !== 0) return dt;
      const dr = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
      if (dr !== 0) return dr;
      return a.gamertag.localeCompare(b.gamertag);
    });
    const data: ContentBundle = { ...bundle, players };
    return {
      ...data,
      live,
      getTeam: (slug) => data.teams.find((t) => t.slug === slug),
      getPlayer: (slug) => data.players.find((p) => p.slug === slug),
      getTeamPlayers: (teamSlug) => data.players.filter((p) => p.teamSlug === teamSlug),
      getMatch: (id) => data.matches.find((m) => m.id === id),
      getTournament: (slug) => data.tournaments.find((t) => t.slug === slug),
      getArticle: (slug) => data.news.find((n) => n.slug === slug),
      upcomingMatches,
      completedMatches: () =>
        data.matches.filter((m) => m.status === "completed").sort(byDateDesc),
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
