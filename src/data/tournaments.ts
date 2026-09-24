import type { Tournament } from "./types";
import data from "./tournaments.json";

export const TOURNAMENTS = data as Tournament[];

export const getTournament = (slug: string) => TOURNAMENTS.find((t) => t.slug === slug);
