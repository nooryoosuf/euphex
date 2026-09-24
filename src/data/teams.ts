import type { Team } from "./types";
import data from "./teams.json";

// Add / remove teams in teams.json — UI renders from this array, no UI changes needed.
export const TEAMS = data as Team[];

export const getTeam = (slug: string) => TEAMS.find((t) => t.slug === slug);
