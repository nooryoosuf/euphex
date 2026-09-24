import type { Match } from "./types";
import data from "./matches.json";

// Match data drives: homepage NEXT MATCH + MATCHDAY, team pages, match pages.
export const MATCHES = data as Match[];

export const getMatch = (id: string) => MATCHES.find((m) => m.id === id);
export const upcomingMatches = () =>
  MATCHES.filter((m) => m.status === "upcoming").sort((a, b) => +new Date(a.date) - +new Date(b.date));
export const completedMatches = () =>
  MATCHES.filter((m) => m.status === "completed").sort((a, b) => +new Date(b.date) - +new Date(a.date));
export const nextMatch = () => upcomingMatches()[0];
