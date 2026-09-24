// Central typed data model — UI never hardcodes teams/players/heroes.
// Swap these files for a CMS later without touching components.

export type LaneRole = "EXP Lane" | "Gold Lane" | "Mid Lane" | "Jungle" | "Roam";

export type HeroCategory = "signature" | "comfort" | "pocket";

export interface HeroEntry {
  name: string;
  slug: string;
  /** Lane the hero is usually played in */
  lane: LaneRole | "Multi";
  /** Placeholder art descriptor — replace `art` with a real URL/CDN path later.
   *  `hue` drives the generated gradient placeholder so no external URLs are needed. */
  art: { hue: number; label: string };
  games: number;
  winRate: number; // 0-100
  kda?: number;
  /** in-game hero power, shown when provided */
  power?: number;
  category: HeroCategory;
}

export interface Achievement {
  title: string;
  event: string;
  year: number;
  kind: "Champion" | "Runner Up" | "MVP" | "Top 4" | "Award";
}

export interface Player {
  slug: string;
  gamertag: string;
  realName: string;
  role: LaneRole;
  secondaryRole?: LaneRole;
  teamSlug: string;
  country: string;
  countryCode: string;
  joined: string;
  matches: number;
  winRate: number;
  mvps: number;
  quote: string;
  playstyle: string;
  signatureMove: string;
  favoriteHero: string;
  heroPool: HeroEntry[];
  achievements: Achievement[];
  /** portrait placeholder hue */
  hue: number;
  number: number;
}

export interface Team {
  slug: string;
  name: string;
  shortName: string;
  tier: "MAIN" | "SECOND" | "ACADEMY" | "DEVELOPMENT";
  index: string; // "01"
  verb: string; // COMPETE / DEVELOP / DISCOVER
  tagline: string;
  description: string;
  playstyle: string[];
  hue: number;
  founded: number;
  wins: number;
  losses: number;
  championships: number;
  achievements: Achievement[];
}

export type MatchStatus = "upcoming" | "live" | "completed";
export type MatchResult = "WIN" | "LOSS" | "DRAW";

export interface GameDetail {
  game: number;
  result: MatchResult;
  duration?: string;
  killsUs?: number;
  killsThem?: number;
  towersUs?: number;
  towersThem?: number;
  mvp?: string;
}

export interface PlayerStatLine {
  playerSlug: string;
  kills: number;
  deaths: number;
  assists: number;
}

export interface Match {
  id: string;
  tournamentSlug: string;
  tournamentName: string;
  stage: string;
  teamSlug: string;
  opponent: string;
  opponentShort: string;
  date: string; // ISO
  status: MatchStatus;
  scoreUs?: number;
  scoreThem?: number;
  result?: MatchResult;
  games?: GameDetail[];
  statLines?: PlayerStatLine[];
  venue?: string;
}

export interface Tournament {
  slug: string;
  name: string;
  stage: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  date: string;
  endDate?: string;
  prizePool?: string;
  venue?: string;
  format?: string;
  teamSlugs: string[];
  placement?: string;
  mvp?: string;
  hue: number;
  description: string;
  journey?: { title: string; text: string }[];
  standings?: { team: string; w: number; l: number }[];
}

export interface NewsArticle {
  slug: string;
  category: "TEAM" | "TOURNAMENT" | "COMMUNITY" | "MATCHDAY";
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  hue: number;
  body: string[];
}

export type MediaCategory = "MATCHDAY" | "TEAM" | "COMMUNITY" | "BEHIND THE SCENES";

export interface MediaItem {
  id: string;
  category: MediaCategory;
  title: string;
  hue: number;
  tall?: boolean;
}

export interface TimelineEvent {
  year: string;
  title: string;
  text: string;
}
