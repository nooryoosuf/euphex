"use client";
import { useMemo, useState } from "react";
import { PLAYERS } from "@/data/players";
import { TEAMS } from "@/data/teams";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { PlayerCard } from "@/components/ui/cards";
import type { LaneRole } from "@/data/types";
import { cn } from "@/lib/utils";

const ROLES: ("All" | LaneRole)[] = ["All", "Jungle", "Mid Lane", "Gold Lane", "EXP Lane", "Roam"];

export default function PlayersPage() {
  const [team, setTeam] = useState("all");
  const [role, setRole] = useState<(typeof ROLES)[number]>("All");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      PLAYERS.filter(
        (p) =>
          (team === "all" || p.teamSlug === team) &&
          (role === "All" || p.role === role) &&
          (q === "" || p.gamertag.toLowerCase().includes(q.toLowerCase()) || p.realName.toLowerCase().includes(q.toLowerCase())),
      ),
    [team, role, q],
  );

  return (
    <>
      <PageHero index="02" label="Athletes" title="PLAYERS." sub="Eight athletes. Five roles. Two squads — filter by team or lane." image={SECTION_BG.players} />
      <div className="sticky top-16 md:top-20 z-30 border-b border-white/8 bg-[#07090D]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 md:px-10 py-3 lg:flex-row lg:items-center">
          <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Team filter">
            {[{ id: "all", label: "All squads" }, ...TEAMS.map((t) => ({ id: t.slug, label: t.shortName }))].map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={team === f.id}
                onClick={() => setTeam(f.id)}
                className={cn(
                  "shrink-0 px-4 py-2 text-[12px] font-bold tracking-[0.16em] uppercase cursor-pointer transition-all",
                  team === f.id ? "bg-[var(--accent)] text-white" : "border border-white/12 text-white/55 hover:text-white",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto" aria-label="Role filter">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn(
                  "shrink-0 px-4 py-2 text-[12px] font-bold tracking-[0.16em] uppercase cursor-pointer transition-all",
                  role === r ? "bg-white text-black" : "border border-white/12 text-white/55 hover:text-white",
                )}
              >
                {r === "All" ? "All roles" : r}
              </button>
            ))}
          </div>
          <label className="lg:ml-auto flex items-center gap-2 border border-white/12 px-4 py-2">
            <span className="sr-only">Search players</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="SEARCH…"
              className="w-full lg:w-44 bg-transparent text-sm tracking-wider placeholder:text-white/30 focus:outline-none"
            />
          </label>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12">
        <p className="label text-white/35 mb-6" role="status">
          {list.length} player{list.length === 1 ? "" : "s"}
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {list.map((p, i) => (
            <PlayerCard key={p.slug} player={p} index={i} />
          ))}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-white/45">No players match. Clear the filters.</p>}
      </div>
    </>
  );
}
