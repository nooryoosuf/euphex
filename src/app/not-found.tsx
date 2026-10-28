"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArticleView } from "@/components/news/ArticleView";
import { PlayerView } from "@/components/player/PlayerView";
import { TeamView } from "@/components/team/TeamView";
import { TournamentDetail } from "@/components/tournament/TournamentDetail";
import { MatchView } from "@/components/match/MatchView";

type DynamicMatch =
  | { type: "news"; slug: string }
  | { type: "players"; slug: string }
  | { type: "teams"; slug: string }
  | { type: "tournaments"; slug: string }
  | { type: "matches"; id: string };

function parsePath(pathname: string): DynamicMatch | null {
  if (!pathname) return null;
  const clean = pathname.replace(/\/+$/, "");

  const newsMatch = clean.match(/(?:^|\/)news\/([^/]+)$/i);
  if (newsMatch) return { type: "news", slug: decodeURIComponent(newsMatch[1]) };

  const playerMatch = clean.match(/(?:^|\/)players\/([^/]+)$/i);
  if (playerMatch) return { type: "players", slug: decodeURIComponent(playerMatch[1]) };

  const teamMatch = clean.match(/(?:^|\/)teams\/([^/]+)$/i);
  if (teamMatch) return { type: "teams", slug: decodeURIComponent(teamMatch[1]) };

  const tourneyMatch = clean.match(/(?:^|\/)tournaments\/([^/]+)$/i);
  if (tourneyMatch) return { type: "tournaments", slug: decodeURIComponent(tourneyMatch[1]) };

  const matchMatch = clean.match(/(?:^|\/)matches\/([^/]+)$/i);
  if (matchMatch) return { type: "matches", id: decodeURIComponent(matchMatch[1]) };

  return null;
}

function DefaultNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center px-5 text-center">
      <p className="label text-[var(--accent)]">404 — Off the map</p>
      <h1 className="font-display mt-4 text-6xl md:text-8xl font-bold tracking-tight">
        LOST IN<br />THE BUSH.
      </h1>
      <p className="mt-4 text-white/55">Even our Roam can&apos;t find this page.</p>
      <Link href="/" className="mt-8 bg-[var(--accent)] px-7 py-3.5 text-[13px] font-bold tracking-[0.14em] uppercase clip-slant">
        Back to base
      </Link>
    </div>
  );
}

export default function NotFound() {
  const [match, setMatch] = useState<DynamicMatch | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMatch(parsePath(window.location.pathname));
    setReady(true);
  }, []);

  if (!ready) {
    const isDynamic = typeof window !== "undefined" && parsePath(window.location.pathname) !== null;
    if (isDynamic) {
      return (
        <div className="mx-auto flex min-h-[70vh] max-w-[1400px] items-center justify-center px-5 text-center text-white/40 animate-pulse">
          Loading...
        </div>
      );
    }
    return <DefaultNotFound />;
  }

  if (match?.type === "news") return <ArticleView slug={match.slug} />;
  if (match?.type === "players") return <PlayerView slug={match.slug} />;
  if (match?.type === "teams") return <TeamView slug={match.slug} />;
  if (match?.type === "tournaments") return <TournamentDetail slug={match.slug} />;
  if (match?.type === "matches") return <MatchView id={match.id} />;

  return <DefaultNotFound />;
}
