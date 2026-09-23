import type { Team } from "./types";

// Add / remove teams here — UI renders from this array, no UI changes needed.
export const TEAMS: Team[] = [
  {
    slug: "main",
    name: "EUPHEX PRIME",
    shortName: "PRIME",
    tier: "MAIN",
    index: "01",
    verb: "COMPETE",
    tagline: "The main roster. The standard-bearers.",
    description:
      "Prime is the flagship MLBB squad — a disciplined, aggressive five built for playoff pressure, Lord dances, and best-of series composure.",
    playstyle: ["AGGRESSIVE.", "DISCIPLINED.", "UNPREDICTABLE."],
    hue: 225,
    founded: 2024,
    wins: 47,
    losses: 16,
    championships: 3,
    achievements: [
      { title: "Champion", event: "Rashu Cup", year: 2025, kind: "Champion" },
      { title: "Champion", event: "Midnight Invitational", year: 2025, kind: "Champion" },
      { title: "Top 4", event: "Continental Qualifier", year: 2026, kind: "Top 4" },
    ],
  },
  {
    slug: "academy",
    name: "EUPHEX ACADEMY",
    shortName: "ACADEMY",
    tier: "ACADEMY",
    index: "02",
    verb: "DEVELOP",
    tagline: "The proving ground. Next-up talent.",
    description:
      "Academy is where mechanics meet system — young talent drilled in rotation, draft discipline, and pro habits until they are Prime-ready.",
    playstyle: ["HUNGRY.", "MECHANICAL.", "FEARLESS."],
    hue: 190,
    founded: 2025,
    wins: 28,
    losses: 14,
    championships: 1,
    achievements: [
      { title: "Champion", event: "Rising Stars League", year: 2025, kind: "Champion" },
      { title: "Runner Up", event: "Academy Clash", year: 2026, kind: "Runner Up" },
    ],
  },
  {
    slug: "rising",
    name: "EUPHEX RISING",
    shortName: "RISING",
    tier: "DEVELOPMENT",
    index: "03",
    verb: "DISCOVER",
    tagline: "The development squad. Raw and relentless.",
    description:
      "Rising scouts ladder standouts and molds them — fundamentals first, flash second. The future of the organization starts here.",
    playstyle: ["RAW.", "RELENTLESS.", "UNFILTERED."],
    hue: 265,
    founded: 2026,
    wins: 15,
    losses: 9,
    championships: 0,
    achievements: [{ title: "Top 4", event: "Open Circuit #4", year: 2026, kind: "Top 4" }],
  },
];

export const getTeam = (slug: string) => TEAMS.find((t) => t.slug === slug);
