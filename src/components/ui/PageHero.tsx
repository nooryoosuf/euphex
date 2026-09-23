"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./Reveal";

export function PageHero({
  index,
  label,
  title,
  sub,
  image,
}: {
  index: string;
  label: string;
  title: string;
  sub?: string;
  image?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <div ref={ref} className="grain relative overflow-hidden border-b border-white/8">
      {/* backdrop — photo with dark cinematic overlay, or gradient fallback */}
      <div className="absolute inset-0" aria-hidden="true">
        {image ? (
          <motion.img
            src={image}
            alt=""
            style={reduce ? undefined : { y }}
            className="absolute inset-[-15%_0] h-[130%] w-full object-cover object-[center_20%]"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: image
              ? "linear-gradient(180deg, rgba(7,9,13,0.66) 0%, rgba(7,9,13,0.45) 40%, rgba(7,9,13,0.92) 85%, #07090D 100%), radial-gradient(70% 90% at 80% 0%, rgba(227,37,107,0.20), transparent 60%)"
              : "radial-gradient(70% 90% at 80% 0%, rgba(227,37,107,0.18), transparent 60%), linear-gradient(180deg, #0B0E17, #07090D)",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 pt-32 md:pt-44 pb-12 md:pb-16">
        <Reveal>
          <p className="label text-white/50 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            <span className="text-[var(--accent)]">{index}</span> — {label}
          </p>
          <h1 className="font-display mt-4 text-5xl md:text-8xl font-bold leading-[0.92] tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)]">
            {title}
          </h1>
          {sub && <p className="mt-5 max-w-xl leading-relaxed text-white/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">{sub}</p>}
        </Reveal>
      </div>
    </div>
  );
}
