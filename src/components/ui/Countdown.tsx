"use client";
import { useEffect, useState } from "react";
import { countdownParts } from "@/lib/utils";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ targetIso, compact = false }: { targetIso: string; compact?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const { d, h, m, s } = countdownParts(targetIso, now);
  const cells: [string, string][] = [
    [pad(d), "Days"],
    [pad(h), "Hrs"],
    [pad(m), "Min"],
    [pad(s), "Sec"],
  ];
  return (
    <div className="flex items-center gap-2 md:gap-3" role="timer" aria-label="Countdown to match">
      {cells.map(([v, l], i) => (
        <div key={l} className="flex items-center gap-2 md:gap-3">
          <div className={`text-center ${compact ? "" : "min-w-[64px] md:min-w-[76px]"}`}>
            <p className={`font-display font-bold tabular-nums ${compact ? "text-2xl" : "text-3xl md:text-5xl"}`}>{v}</p>
            <p className="label mt-1 text-white/35 !text-[9px] md:!text-[10px]">{l}</p>
          </div>
          {i < cells.length - 1 && <span className="font-display text-xl md:text-3xl text-[var(--accent)] -mt-5">:</span>}
        </div>
      ))}
    </div>
  );
}
