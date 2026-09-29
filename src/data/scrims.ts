"use client";
// Scrim request model + storage.
//
// HOW DELIVERY WORKS (static site, no server):
//  1. Every submission is ALWAYS saved to this browser's local outbox
//     (instant confirmation, works offline, survives refresh).
//  2. If `contact.scrimInboxEmail` is set in site config, the request is
//     ALSO posted to that inbox via FormSubmit's ajax endpoint (no signup —
//     first submission triggers a one-time activation email to the inbox).
//  3. The dashboard Scrims tab reads this device's outbox. True cross-device
//     delivery = the email inbox above. A shared realtime backend (e.g.
//     Supabase) can replace `postToInbox` later without touching the form.

export type ScrimMatchType = "BO3" | "BO5" | "BO7";
export type ScrimStatus = "pending" | "approved" | "rejected";

export interface ScrimRequest {
  id: string;
  teamName: string;
  teamTag: string;
  contactPerson: string;
  contactDetail: string;
  email: string;
  date: string;
  time: string;
  matchType: ScrimMatchType;
  notes: string;
  status: ScrimStatus;
  createdAt: string;
}

export const SCRIM_KEY = "euphex-scrim-requests";

export function loadScrimRequests(): ScrimRequest[] {
  try {
    const raw = localStorage.getItem(SCRIM_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ScrimRequest[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function persist(list: ScrimRequest[]) {
  try {
    localStorage.setItem(SCRIM_KEY, JSON.stringify(list));
  } catch {
    /* private mode — outbox unavailable */
  }
}

export function saveScrimRequest(data: Omit<ScrimRequest, "id" | "status" | "createdAt">): ScrimRequest {
  const req: ScrimRequest = {
    ...data,
    id: `scrim-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const list = loadScrimRequests();
  list.unshift(req);
  persist(list);
  return req;
}

export function setScrimStatus(id: string, status: ScrimStatus) {
  persist(loadScrimRequests().map((r) => (r.id === id ? { ...r, status } : r)));
}

export function deleteScrimRequest(id: string) {
  persist(loadScrimRequests().filter((r) => r.id !== id));
}

/** POST the request to the org inbox. Returns true when delivered. */
export async function postToInbox(req: ScrimRequest, inboxEmail: string): Promise<boolean> {
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inboxEmail)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `Scrim request: ${req.teamName} (${req.teamTag}) — ${req.date} ${req.time}`,
        "Team Name": req.teamName,
        "Team Tag": req.teamTag,
        "Contact Person": req.contactPerson,
        "Contact / Discord": req.contactDetail,
        Email: req.email,
        Date: req.date,
        Time: req.time,
        "Match Type": req.matchType,
        Notes: req.notes || "—",
        "Request ID": req.id,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
