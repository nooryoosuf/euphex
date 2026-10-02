// ─────────────────────────────────────────────────────────────
// Supabase content backend — live reads (anon key, public read policy).
// Falls back to bundled JSON seeds when env is missing or offline,
// so prerendered HTML and local dev always work.
// Row shapes use snake_case; mappers below restore the TS model.
// ─────────────────────────────────────────────────────────────
"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Match, MediaItem, NewsArticle, Player, Team, TimelineEvent, Tournament,
} from "@/data/types";
import playersSeed from "@/data/players.json";
import teamsSeed from "@/data/teams.json";
import matchesSeed from "@/data/matches.json";
import tournamentsSeed from "@/data/tournaments.json";
import contentSeed from "@/data/content.json";

export interface ContentBundle {
  players: Player[];
  teams: Team[];
  matches: Match[];
  tournaments: Tournament[];
  news: NewsArticle[];
  media: MediaItem[];
  timeline: TimelineEvent[];
}

export const seedBundle = (): ContentBundle => ({
  players: structuredClone(playersSeed) as Player[],
  teams: structuredClone(teamsSeed) as Team[],
  matches: structuredClone(matchesSeed) as Match[],
  tournaments: structuredClone(tournamentsSeed) as Tournament[],
  news: structuredClone((contentSeed as { news: NewsArticle[] }).news),
  media: structuredClone((contentSeed as { media: MediaItem[] }).media),
  timeline: structuredClone((contentSeed as { timeline: TimelineEvent[] }).timeline),
});

let client: SupabaseClient | null = null;

export function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const arr = <T>(v: unknown, fallback: T[] = []): T[] => (Array.isArray(v) ? (v as T[]) : fallback);

export function mapPlayer(r: Row): Player {
  return {
    slug: r.slug, gamertag: r.gamertag, realName: r.real_name ?? "",
    role: r.role, secondaryRole: r.secondary_role ?? undefined,
    teamSlug: r.team_slug ?? "", country: r.country ?? "", countryCode: r.country_code ?? "",
    joined: r.joined ?? "", matches: r.matches ?? 0, winRate: Number(r.win_rate ?? 0),
    mvps: r.mvps ?? 0, quote: r.quote ?? "", playstyle: r.playstyle ?? "",
    signatureMove: r.signature_move ?? "", favoriteHero: r.favorite_hero ?? "",
    hue: r.hue ?? 220, number: r.number ?? 0,
    heroPool: arr(r.hero_pool), achievements: arr(r.achievements),
    banner: (r.banner as Player["banner"]) ?? undefined,
    avatar: (r.avatar as Player["avatar"]) ?? undefined,
  };
}

export function mapTeam(r: Row): Team {
  return {
    slug: r.slug, name: r.name, shortName: r.short_name ?? "", tier: r.tier ?? "SECOND",
    index: r.index ?? "", verb: r.verb ?? "", tagline: r.tagline ?? "",
    description: r.description ?? "", playstyle: arr<string>(r.playstyle),
    hue: r.hue ?? 220, founded: r.founded ?? 2026,
    wins: r.wins ?? 0, losses: r.losses ?? 0, championships: r.championships ?? 0,
    achievements: arr(r.achievements),
  };
}

export function mapMatch(r: Row): Match {
  return {
    id: r.id, tournamentSlug: r.tournament_slug ?? "", tournamentName: r.tournament_name ?? "",
    stage: r.stage ?? "", teamSlug: r.team_slug ?? "", opponent: r.opponent ?? "",
    opponentShort: r.opponent_short ?? "", date: r.date ?? "", status: r.status ?? "upcoming",
    scoreUs: r.score_us ?? undefined, scoreThem: r.score_them ?? undefined,
    result: r.result ?? undefined, games: r.games ?? undefined,
    statLines: r.stat_lines ?? undefined, venue: r.venue ?? undefined,
  };
}

export function mapTournament(r: Row): Tournament {
  return {
    slug: r.slug, name: r.name, stage: r.stage ?? "", status: r.status ?? "UPCOMING",
    date: r.date ?? "", endDate: r.end_date ?? undefined, prizePool: r.prize_pool ?? undefined,
    venue: r.venue ?? undefined, format: r.format ?? undefined,
    teamSlugs: arr<string>(r.team_slugs), placement: r.placement ?? undefined,
    mvp: r.mvp ?? undefined, hue: r.hue ?? 220, description: r.description ?? "",
    journey: r.journey ?? undefined, standings: r.standings ?? undefined,
  };
}

export function mapNews(r: Row): NewsArticle {
  return {
    slug: r.slug, category: r.category ?? "TEAM", title: r.title ?? "",
    excerpt: r.excerpt ?? "", date: r.date ?? "", readMinutes: r.read_minutes ?? 3,
    hue: r.hue ?? 220, body: arr<string>(r.body),
  };
}

export function mapMedia(r: Row): MediaItem {
  return {
    id: r.id, category: r.category ?? "TEAM", title: r.title ?? "",
    hue: r.hue ?? 220, tall: r.tall ?? undefined,
  };
}

export function mapTimeline(r: Row): TimelineEvent {
  return { year: String(r.year ?? ""), title: r.title ?? "", text: r.text ?? "" };
}

// ── Reverse mappers: TS model → Supabase rows (admin writes) ──

export function playerToRow(p: Player): Row {
  return {
    slug: p.slug, gamertag: p.gamertag, real_name: p.realName, role: p.role,
    secondary_role: p.secondaryRole ?? null, team_slug: p.teamSlug, country: p.country,
    country_code: p.countryCode, joined: p.joined, matches: p.matches,
    win_rate: p.winRate, mvps: p.mvps, quote: p.quote, playstyle: p.playstyle,
    signature_move: p.signatureMove, favorite_hero: p.favoriteHero, hue: p.hue,
    number: p.number, hero_pool: p.heroPool, achievements: p.achievements,
    banner: p.banner ?? null, avatar: p.avatar ?? null,
  };
}

export function teamToRow(t: Team): Row {
  return {
    slug: t.slug, name: t.name, short_name: t.shortName, tier: t.tier, index: t.index,
    verb: t.verb, tagline: t.tagline, description: t.description, playstyle: t.playstyle,
    hue: t.hue, founded: t.founded, wins: t.wins, losses: t.losses,
    championships: t.championships, achievements: t.achievements,
  };
}

export function matchToRow(m: Match): Row {
  return {
    id: m.id, tournament_slug: m.tournamentSlug, tournament_name: m.tournamentName,
    stage: m.stage, team_slug: m.teamSlug, opponent: m.opponent,
    opponent_short: m.opponentShort, date: m.date, status: m.status,
    score_us: m.scoreUs ?? null, score_them: m.scoreThem ?? null,
    result: m.result ?? null, games: m.games ?? null,
    stat_lines: m.statLines ?? null, venue: m.venue ?? null,
  };
}

export function tournamentToRow(t: Tournament): Row {
  return {
    slug: t.slug, name: t.name, stage: t.stage, status: t.status, date: t.date,
    end_date: t.endDate ?? null, prize_pool: t.prizePool ?? null, venue: t.venue ?? null,
    format: t.format ?? null, team_slugs: t.teamSlugs, placement: t.placement ?? null,
    mvp: t.mvp ?? null, hue: t.hue, description: t.description,
    journey: t.journey ?? null, standings: t.standings ?? null,
  };
}

export function newsToRow(n: NewsArticle): Row {
  return {
    slug: n.slug, category: n.category, title: n.title, excerpt: n.excerpt,
    date: n.date, read_minutes: n.readMinutes, hue: n.hue, body: n.body,
  };
}

export function mediaToRow(m: MediaItem): Row {
  return {
    id: m.id, category: m.category, title: m.title, hue: m.hue,
    tall: m.tall ?? false,
  };
}

export function timelineToRow(t: TimelineEvent & { id?: number }): Row {
  const row: Row = { year: t.year, title: t.title, text: t.text };
  if (t.id != null) row.id = t.id;
  return row;
}

export async function fetchLiveContent(): Promise<ContentBundle | null> {
  const sb = supabase();
  if (!sb) return null;
  try {
    const [players, teams, matches, tournaments, news, media, timeline] = await Promise.all([
      sb.from("players").select("*"),
      sb.from("teams").select("*"),
      sb.from("matches").select("*"),
      sb.from("tournaments").select("*"),
      sb.from("news").select("*"),
      sb.from("media").select("*"),
      sb.from("timeline").select("*").order("id"),
    ]);
    const parts = [players, teams, matches, tournaments, news, media, timeline];
    if (parts.some((p) => p.error)) return null;
    return {
      players: (players.data as Row[]).map(mapPlayer),
      teams: (teams.data as Row[]).map(mapTeam),
      matches: (matches.data as Row[]).map(mapMatch),
      tournaments: (tournaments.data as Row[]).map(mapTournament),
      news: (news.data as Row[]).map(mapNews),
      media: (media.data as Row[]).map(mapMedia),
      timeline: (timeline.data as Row[]).map(mapTimeline),
    };
  } catch {
    return null;
  }
}
