"use client";
import { useState, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── field primitives (mobile-first) ── */

export function F({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label !text-[10px] text-white/40">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[var(--accent)]";

export function T(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function N(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className={cn(inputCls, props.className)} />;
}

export function TA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(inputCls, props.className)} />;
}

export function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(inputCls, "[&>option]:bg-black", props.className)}>
      {children}
    </select>
  );
}

/* ── generic list editor (hero pools, achievements, games…) ── */

export function ListEditor<T>({
  items,
  onChange,
  render,
  onAdd,
  addLabel,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, remove: () => void, index: number) => ReactNode;
  onAdd: () => T;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-white/10 bg-black/30 p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="label !text-[10px] text-[var(--accent)]">
              #{i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove item ${i + 1}`}
              className="inline-flex size-8 items-center justify-center border border-white/12 text-white/50 hover:text-red-300 hover:border-red-400/50 cursor-pointer transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          {render(
            item,
            (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))),
            () => onChange(items.filter((_, j) => j !== i)),
            i,
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, onAdd()])}
        className="inline-flex w-full items-center justify-center gap-2 border border-dashed border-white/20 px-4 py-3 text-[12px] font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white hover:border-[var(--accent)] cursor-pointer transition-colors"
      >
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

/* ── bottom-sheet modal (fullscreen on mobile) ── */

export function Sheet({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center bg-black/80 p-0 md:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col border border-white/15 bg-[#0C0F16]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="font-display text-xl font-bold">{title}</p>
          <button onClick={onClose} aria-label="Close editor" className="inline-flex size-9 items-center justify-center border border-white/15 hover:border-[var(--accent)] cursor-pointer">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">{children}</div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4">
          <button onClick={onClose} className="border border-white/15 px-4 py-3 text-xs font-bold tracking-[0.18em] uppercase text-white/70 hover:text-white cursor-pointer">
            Cancel
          </button>
          <button onClick={onSave} className="bg-[var(--accent)] px-4 py-3 text-xs font-bold tracking-[0.18em] uppercase text-white hover:brightness-110 cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [msg, setMsg] = useState<string | null>(null);
  const [fn, setFn] = useState<(() => void) | null>(null);
  const ask = (message: string, onYes: () => void) => {
    setMsg(message);
    setFn(() => onYes);
  };
  const node = msg ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6" role="alertdialog" aria-modal="true" aria-label="Confirm">
      <div className="w-full max-w-sm border border-white/15 bg-[#0C0F16] p-6">
        <p className="text-sm leading-relaxed">{msg}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => setMsg(null)} className="border border-white/15 px-4 py-2.5 text-xs font-bold tracking-[0.16em] uppercase cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => {
              fn?.();
              setMsg(null);
            }}
            className="bg-red-500/90 px-4 py-2.5 text-xs font-bold tracking-[0.16em] uppercase cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  ) : null;
  return { ask, node };
}
