import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeader({
  index,
  label,
  title,
  href,
  linkLabel = "View all",
  className,
}: {
  index: string;
  label: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("mb-10 md:mb-14", className)}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="label text-white/40">
            <span className="text-[var(--accent)]">{index}</span>
            {"  —  "}
            {label}
          </p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight">{title}</h2>
        </div>
        {href && (
          <Link
            href={href}
            className="group hidden md:inline-flex shrink-0 items-center gap-2 text-sm font-semibold tracking-wide text-white/70 hover:text-white transition-colors"
          >
            <span className="border-b border-white/20 pb-1 group-hover:border-[var(--accent)]">{linkLabel.toUpperCase()}</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  type,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "dark";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const styles = cn(
    "group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[13px] font-bold tracking-[0.14em] uppercase transition-all duration-300 clip-slant cursor-pointer",
    variant === "primary" && "bg-[var(--accent)] text-white hover:brightness-110",
    variant === "ghost" && "border border-white/15 text-white hover:border-[var(--accent)] hover:text-white",
    variant === "dark" && "bg-white text-black hover:bg-[var(--accent)] hover:text-white",
    className,
  );
  const inner = (
    <>
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );
  if (href)
    return (
      <Link href={href} className={styles}>
        {inner}
      </Link>
    );
  return (
    <button type={type ?? "button"} onClick={onClick} className={styles}>
      {inner}
    </button>
  );
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "win" | "loss" | "draw" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] uppercase",
        tone === "default" && "bg-white/8 text-white/70 border border-white/10",
        tone === "accent" && "bg-[var(--accent)]/15 text-[#FF8FB4] border border-[var(--accent)]/30",
        tone === "win" && "bg-emerald-400/10 text-emerald-300 border border-emerald-400/25",
        tone === "loss" && "bg-red-400/10 text-red-300 border border-red-400/25",
        tone === "draw" && "bg-amber-300/10 text-amber-200 border border-amber-300/25",
      )}
    >
      {children}
    </span>
  );
}

export function Stat({ value, label, suffix }: { value: React.ReactNode; label: string; suffix?: string }) {
  return (
    <div className="border-l border-white/10 pl-4">
      <p className="font-display text-3xl md:text-4xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-[var(--accent)]">{suffix}</span>}
      </p>
      <p className="label mt-1 text-white/40">{label}</p>
    </div>
  );
}
