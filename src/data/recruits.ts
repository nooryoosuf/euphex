"use client";
// Recruitment application model + storage. Same delivery architecture as
// scrim requests (see src/data/scrims.ts):
//  1. Always saved to this browser's local outbox.
//  2. Also emailed to the org inbox when `contact.recruitInboxEmail` is set
//     (falls back to `contact.scrimInboxEmail`, then local-only).
//  3. Dashboard Recruits tab reviews this device's outbox.

export interface LeaderboardHero {
  hero: string;
  rank: string;
}

export interface TournamentEntry {
  name: string;
  result: string;
  year: string;
}

export type RecruitStatus = "pending" | "approved" | "rejected";

export interface RecruitRequest {
  id: string;
  fullName: string;
  age: number;
  contactDetail: string;
  email: string;
  ign: string;
  uid: string;
  country: string;
  highestRank: string;
  mainRole: string;
  playableRoles: string[];
  signatureHero: string;
  heroPool: string;
  previousTeams: string;
  tournaments: TournamentEntry[];
  leaderboard: LeaderboardHero[];
  tryoutDate: string;
  tryoutTime: string;
  availability: string;
  status: RecruitStatus;
  createdAt: string;
}

export const RECRUIT_KEY = "euphex-recruit-requests";

export const RANK_LADDER = [
  "Warrior",
  "Elite",
  "Master",
  "Grandmaster",
  "Epic",
  "Legend",
  "Mythic",
  "Mythical Honor",
  "Mythical Glory",
  "Mythical Immortal",
];

export const LANES = ["Gold Lane", "EXP Lane", "Mid Lane", "Jungle", "Roam"];

export function loadRecruitRequests(): RecruitRequest[] {
  try {
    const raw = localStorage.getItem(RECRUIT_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecruitRequest[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function persist(list: RecruitRequest[]) {
  try {
    localStorage.setItem(RECRUIT_KEY, JSON.stringify(list));
  } catch {
    /* private mode — outbox unavailable */
  }
}

export function saveRecruitRequest(data: Omit<RecruitRequest, "id" | "status" | "createdAt">): RecruitRequest {
  const req: RecruitRequest = {
    ...data,
    id: `recruit-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const list = loadRecruitRequests();
  list.unshift(req);
  persist(list);
  return req;
}

export function setRecruitStatus(id: string, status: RecruitStatus) {
  persist(loadRecruitRequests().map((r) => (r.id === id ? { ...r, status } : r)));
}

export function deleteRecruitRequest(id: string) {
  persist(loadRecruitRequests().filter((r) => r.id !== id));
}

/** POST the application to the org inbox. Returns true when delivered. */
export async function postRecruitToInbox(req: RecruitRequest, inboxEmail: string): Promise<boolean> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inboxEmail)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `Recruitment: ${req.fullName} (${req.ign}) — ${req.mainRole}`,
        "Full Name": req.fullName,
        Age: String(req.age),
        "Contact / Discord": req.contactDetail,
        Email: req.email,
        IGN: req.ign,
        UID: req.uid,
        Country: req.country,
        "Highest Rank": req.highestRank,
        "Main Role": req.mainRole,
        "Roles You Can Play": req.playableRoles.join(", ") || "—",
        "Signature Hero": req.signatureHero,
        "Hero Pool": req.heroPool || "—",
        "Previous Teams": req.previousTeams || "—",
        Tournaments: req.tournaments.length
          ? req.tournaments.map((t) => `${t.name} — ${t.result} (${t.year})`).join(" | ")
          : "—",
        "Leaderboard Heroes": req.leaderboard
          .filter((l) => l.hero.trim())
          .map((l) => `${l.hero} (#${l.rank || "?"})`)
          .join(" | ") || "—",
        "Tryout Date": req.tryoutDate,
        "Tryout Time": `${req.tryoutTime} (GMT+05:00 Maldives)`,
        Availability: req.availability || "—",
        "Application ID": req.id,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
