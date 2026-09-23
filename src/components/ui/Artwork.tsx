import { cn } from "@/lib/utils";

// Local placeholder artwork — gradient + monogram, no external URLs.
// Swap `Artwork` internals for next/image CDN art later.
export function Artwork({
  hue,
  label,
  className,
  rounded = false,
}: {
  hue: number;
  label: string;
  className?: string;
  rounded?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden grain", rounded && "rounded-full", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 60% 16%) 0%, hsl(${(hue + 40) % 360} 70% 32%) 55%, hsl(${hue} 80% 8%) 100%)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(80% 90% at 70% 10%, hsl(${hue} 90% 60% / 0.35), transparent 60%)` }}
      />
      {/* oversized monogram */}
      <span className="font-display absolute -bottom-4 -right-1 text-[7rem] leading-none font-bold text-white/10 select-none">
        {label}
      </span>
      {/* scan lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,.4) 3px 4px)" }}
      />
    </div>
  );
}

export function OrgMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 6h24L24 13H8l-4-7z" fill="currentColor" />
      <path d="M8 13h16l-4 7H8l0-7z" fill="currentColor" opacity="0.7" />
      <path d="M12 20h12l-4 6H8l4-6z" fill="#E3256B" />
    </svg>
  );
}
