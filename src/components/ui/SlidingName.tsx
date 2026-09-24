"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Boundary-kept display name. Short names render static; long names
 * glide side-to-side in a slow ping-pong loop inside the boundary —
 * nothing ever overflows its container.
 */
export function SlidingName({ text, className }: { text: string; className?: string }) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [dist, setDist] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      if (!outer.current || !inner.current) return;
      setDist(Math.max(0, inner.current.scrollWidth - outer.current.clientWidth));
    };
    measure();
    const t = setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  if (reduce || dist === 0) {
    return <span className={cn("block truncate", className)}>{text}</span>;
  }
  return (
    <span ref={outer} className={cn("block overflow-hidden", className)} aria-label={text}>
      <motion.span
        ref={inner}
        aria-hidden="true"
        className="inline-block whitespace-nowrap will-change-transform"
        initial={{ x: 0 }}
        animate={{ x: [0, -dist] }}
        transition={{
          duration: Math.min(9, Math.max(3.5, dist / 45)),
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          repeatDelay: 1.2,
        }}
      >
        {text}
      </motion.span>
    </span>
  );
}
