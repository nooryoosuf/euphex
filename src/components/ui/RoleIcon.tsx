import type { LaneRole } from "@/data/types";

// Consistent role icon system — custom minimal SVG marks, one design language.
const PATHS: Record<LaneRole, React.ReactNode> = {
  Jungle: (
    <path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  "Mid Lane": (
    <>
      <path d="M12 3l8 9-8 9-8-9 8-9z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </>
  ),
  Roam: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </>
  ),
  "EXP Lane": (
    <>
      <path d="M4 20L20 4M7 4h4v4M13 20h4v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "Gold Lane": (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
};

const SHORT: Record<LaneRole, string> = {
  "EXP Lane": "EXP",
  "Gold Lane": "GOLD",
  "Mid Lane": "MID",
  Jungle: "JUNGLE",
  Roam: "ROAM",
};

export function RoleIcon({ role, className = "size-4" }: { role: LaneRole; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {PATHS[role]}
    </svg>
  );
}

export function RoleBadge({ role, className = "" }: { role: LaneRole; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] text-white/60 ${className}`}
    >
      <span className="text-[var(--accent)]">
        <RoleIcon role={role} />
      </span>
      {SHORT[role]}
    </span>
  );
}
