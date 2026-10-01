"use client";
import { useState } from "react";
import { Check, Download, RefreshCw, Trash2, X } from "lucide-react";
import {
  loadRecruitRequests, setRecruitStatus, deleteRecruitRequest,
  type RecruitRequest, type RecruitStatus,
} from "@/data/recruits";
import { cn } from "@/lib/utils";

type Filter = "all" | RecruitStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: RecruitStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] uppercase border",
        status === "pending" && "bg-amber-300/10 text-amber-200 border-amber-300/25",
        status === "approved" && "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
        status === "rejected" && "bg-red-400/10 text-red-300 border-red-400/25",
      )}
    >
      {status}
    </span>
  );
}

export function RecruitsInbox() {
  const [items, setItems] = useState<RecruitRequest[]>(() => loadRecruitRequests());
  const [filter, setFilter] = useState<Filter>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const refresh = () => setItems(loadRecruitRequests());

  const act = (id: string, status: RecruitStatus) => {
    setRecruitStatus(id, status);
    refresh();
  };
  const remove = (id: string) => {
    deleteRecruitRequest(id);
    setConfirmId(null);
    refresh();
  };

  const shown = items.filter((r) => filter === "all" || r.status === filter);
  const pending = items.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Application status filter">
          {FILTERS.map((f) => {
            const n = f.id === "all" ? items.length : items.filter((r) => r.status === f.id).length;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-4 py-2 text-[12px] font-bold tracking-[0.14em] uppercase cursor-pointer transition-all",
                  filter === f.id ? "bg-white text-black" : "border border-white/12 text-white/55 hover:text-white",
                )}
              >
                {f.label} ({n})
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "recruit-requests.json";
              a.click();
            }}
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[12px] font-bold tracking-[0.14em] uppercase text-white/70 hover:text-white cursor-pointer"
          >
            <Download className="size-4" /> Export
          </button>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-[12px] font-bold tracking-[0.14em] uppercase text-white/70 hover:text-white cursor-pointer"
          >
            <RefreshCw className="size-4" /> Refresh
          </button>
        </div>
      </div>

      <p className="mt-4 border border-white/8 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/45">
        This inbox shows applications submitted on <strong className="text-white/70">this device and browser</strong>
        {pending > 0 && <> — <strong className="text-amber-200">{pending} awaiting review</strong></>}.
        Applications from other devices arrive in the configured email inbox. Personal details here are private —
        they are never published to the site.
      </p>

      <div className="mt-4 space-y-3">
        {shown.length === 0 && (
          <p className="py-10 text-center text-sm text-white/40">
            {items.length === 0 ? "No applications yet. Share the Recruitment page." : `Nothing ${filter}.`}
          </p>
        )}
        {shown.map((r) => (
          <div key={r.id} className="border border-white/8 bg-[#0C0F16]">
            <button
              onClick={() => setOpenId(openId === r.id ? null : r.id)}
              aria-expanded={openId === r.id}
              className="flex w-full items-center justify-between gap-3 p-4 text-left cursor-pointer"
            >
              <span className="min-w-0">
                <span className="font-display block truncate text-xl font-bold">
                  {r.fullName} <span className="text-white/40">({r.ign})</span>
                </span>
                <span className="mt-1 block text-xs text-white/45">
                  {r.mainRole} · {r.highestRank} · tryout {r.tryoutDate} {r.tryoutTime}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <StatusBadge status={r.status} />
                <span className="text-white/30">{openId === r.id ? "–" : "+"}</span>
              </span>
            </button>
            {openId === r.id && (
              <div className="border-t border-white/8 p-4">
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  {[
                    ["Age", String(r.age)],
                    ["Contact / Discord", r.contactDetail],
                    ["Email", r.email],
                    ["UID", r.uid],
                    ["Country", r.country],
                    ["Signature Hero", r.signatureHero],
                    ["Playable Roles", r.playableRoles.join(", ") || "—"],
                    ["Reference", r.id.toUpperCase()],
                    ["Submitted", new Date(r.createdAt).toLocaleString("en-GB")],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="label !text-[10px] text-white/35">{k}</dt>
                      <dd className="mt-0.5 break-words font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
                {r.heroPool && (
                  <div className="mt-3">
                    <p className="label !text-[10px] text-white/35">Hero Pool</p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-white/75">{r.heroPool}</p>
                  </div>
                )}
                {r.previousTeams && (
                  <div className="mt-3">
                    <p className="label !text-[10px] text-white/35">Previous Teams</p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-white/75">{r.previousTeams}</p>
                  </div>
                )}
                {r.tournaments.length > 0 && (
                  <div className="mt-3">
                    <p className="label !text-[10px] text-white/35">Tournaments</p>
                    <ul className="mt-1 space-y-1 text-sm text-white/75">
                      {r.tournaments.map((t, i) => (
                        <li key={i}>• {t.name} — {t.result} ({t.year})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {r.leaderboard.length > 0 && (
                  <div className="mt-3">
                    <p className="label !text-[10px] text-white/35">Leaderboard Heroes</p>
                    <ul className="mt-1 space-y-1 text-sm text-white/75">
                      {r.leaderboard.map((l, i) => (
                        <li key={i}>• {l.hero} (#{l.rank || "?"})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {r.availability && (
                  <div className="mt-3">
                    <p className="label !text-[10px] text-white/35">Availability</p>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-white/75">{r.availability}</p>
                  </div>
                )}
                {confirmId === r.id ? (
                  <div className="mt-4 flex items-center gap-3 border border-red-400/30 bg-red-400/5 p-3">
                    <p className="flex-1 text-sm">Delete this application permanently?</p>
                    <button onClick={() => remove(r.id)} className="bg-red-500/90 px-4 py-2 text-xs font-bold tracking-[0.14em] uppercase cursor-pointer">Yes</button>
                    <button onClick={() => setConfirmId(null)} aria-label="Cancel delete" className="border border-white/15 p-2 cursor-pointer"><X className="size-4" /></button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => act(r.id, "approved")}
                      disabled={r.status === "approved"}
                      className="inline-flex items-center justify-center gap-1.5 bg-emerald-500/90 px-2 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase cursor-pointer hover:brightness-110 disabled:opacity-30 disabled:cursor-default"
                    >
                      <Check className="size-4" /> Approve
                    </button>
                    <button
                      onClick={() => act(r.id, "rejected")}
                      disabled={r.status === "rejected"}
                      className="border border-amber-300/40 px-2 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase text-amber-200 hover:bg-amber-300/10 cursor-pointer disabled:opacity-30 disabled:cursor-default"
                    >
                      <X className="size-4" /> Reject
                    </button>
                    <button
                      onClick={() => setConfirmId(r.id)}
                      className="inline-flex items-center justify-center gap-1.5 border border-white/12 px-2 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase text-white/50 hover:text-red-300 hover:border-red-400/50 cursor-pointer"
                    >
                      <Trash2 className="size-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
