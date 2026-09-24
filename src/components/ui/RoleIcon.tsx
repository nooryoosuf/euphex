import type { LaneRole } from "@/data/types";
import { LANE_ICONS } from "@/components/ui/LaneIcons";

// Consistent role icon system — the organization's own lane marks,
// one design language, recolorable via currentColor.
const SHORT: Record<LaneRole, string> = {
  "EXP Lane": "EXP",
  "Gold Lane": "GOLD",
  "Mid Lane": "MID",
  Jungle: "JUNGLE",
  Roam: "ROAM",
};

export function RoleIcon({ role, className = "size-4" }: { role: LaneRole; className?: string }) {
  const Icon = LANE_ICONS[role];
  return <Icon className={className} />;
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
