import type { Player } from "./types";
import data from "./players.json";

// Players live in players.json — edit there (or via /admin), every page updates.
export const PLAYERS = data as Player[];

export const getPlayer = (slug: string) => PLAYERS.find((p) => p.slug === slug);
export const getTeamPlayers = (teamSlug: string) => PLAYERS.filter((p) => p.teamSlug === teamSlug);
