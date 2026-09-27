"use client";
// Renders the roast as a 1080×1920 story image (Instagram / TikTok / Discord)
// on a <canvas> — centered editorial layout: circular hero medallion,
// tracked-out eyebrows, giant pull-quote, broadcast frame.
// The URL comes from siteConfig, so it follows the finalized domain automatically.

import { siteConfig } from "@/config/site";

export interface RoastCardArt {
  title: string;
  roast: string;
  name: string;
  role: string;
  hero: string;
  level: string;
  heroImage: string | null;
}

const W = 1080;
const H = 1920;
const ACCENT = "#E3256B";
const VOID = "#07090D";
const CX = W / 2;

function track(text: string): string {
  return text.split("").join("  ");
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2 - dh * 0.08, dw, dh);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (!para.trim()) {
      out.push("");
      continue;
    }
    const words = para.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

export async function renderRoastCard(art: RoastCardArt): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const url = siteConfig.org.url.replace(/^https?:\/\//, "").replace(/\/$/, "").toUpperCase();

  // base void
  ctx.fillStyle = VOID;
  ctx.fillRect(0, 0, W, H);

  // faint hero texture behind everything
  const heroImg = art.heroImage ? await loadImage(art.heroImage) : null;
  if (heroImg) {
    ctx.save();
    ctx.globalAlpha = 0.32;
    cover(ctx, heroImg, 0, 0, W, H);
    ctx.restore();
  }
  // site gradient system
  const glow = ctx.createRadialGradient(CX, 300, 60, CX, 300, W * 0.7);
  glow.addColorStop(0, "rgba(227,37,107,0.28)");
  glow.addColorStop(1, "rgba(227,37,107,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(7,9,13,0.45)");
  g.addColorStop(0.5, "rgba(7,9,13,0.82)");
  g.addColorStop(1, VOID);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // diagonal streaks (subtle)
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  for (let x = -H; x < W + H; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + H * 0.36, H);
    ctx.stroke();
  }
  ctx.restore();

  // broadcast frame + corner ticks
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 8;
  const tick = (x: number, y: number, dx: number, dy: number) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * 56, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * 56);
    ctx.stroke();
  };
  tick(36, 36, 1, 1);
  tick(W - 36, 36, -1, 1);
  tick(36, H - 36, 1, -1);
  tick(W - 36, H - 36, -1, -1);

  ctx.textAlign = "center";

  // brand masthead (centered)
  ctx.fillStyle = ACCENT;
  ctx.fillRect(CX - 60, 108, 120, 8);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 44px system-ui, sans-serif";
  ctx.fillText("E U P H E X", CX, 184);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 25px system-ui, sans-serif";
  ctx.fillText(`R O A S T   C A R D`, CX, 226);

  // circular hero medallion
  const cy = 425;
  const r = 105;
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (heroImg) {
    const s = Math.max((r * 2) / heroImg.width, (r * 2) / heroImg.height);
    const dw = heroImg.width * s;
    const dh = heroImg.height * s;
    ctx.drawImage(heroImg, CX - dw / 2, cy - dh / 2 - dh * 0.1, dw, dh);
  } else {
    const mg = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    mg.addColorStop(0, "#2A1030");
    mg.addColorStop(1, "#141021");
    ctx.fillStyle = mg;
    ctx.fillRect(CX - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "900 110px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(art.hero.slice(0, 2).toUpperCase(), CX, cy + 40);
  }
  ctx.restore();
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(CX, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // eyebrow
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "600 27px system-ui, sans-serif";
  ctx.fillText(track(`CERTIFIED ${art.role.toUpperCase()} · ${art.hero.toUpperCase()}`), CX, 590);

  // hero name — editorial display
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 104px system-ui, sans-serif";
  const nameLines = wrap(ctx, art.hero.toUpperCase(), W - 180);
  let y = 726;
  for (const l of nameLines.slice(0, 2)) {
    ctx.fillText(l, CX, y);
    y += 112;
  }

  // giant quotation mark
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.9;
  ctx.font = "900 190px Georgia, serif";
  ctx.fillText("“", CX, y + 96);
  ctx.globalAlpha = 1;

  // pull-quote — italic serif, centered, auto-fit
  const quoteTop = y + 130;
  const quoteBottom = 1600;
  let size = 46;
  let lines: string[] = [];
  const measure = () => {
    ctx.font = `italic 500 ${size}px Georgia, serif`;
    lines = wrap(ctx, art.roast, W - 200);
    return lines.reduce((a, l) => a + (l === "" ? size * 0.55 : size * 1.5), 0);
  };
  while (size > 28 && measure() > quoteBottom - quoteTop) size -= 2;
  measure();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `italic 500 ${size}px Georgia, serif`;
  const lh = size * 1.5;
  const eh = size * 0.55;
  y = quoteTop;
  for (const l of lines) {
    if (l === "") {
      y += eh;
      continue;
    }
    ctx.fillText(l, CX, y);
    y += lh;
  }

  // footer
  ctx.fillStyle = ACCENT;
  ctx.fillRect(CX - 420, 1652, 840, 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 38px system-ui, sans-serif";
  ctx.fillText(art.name.toUpperCase(), CX, 1716);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(`${url}/ROAST`, CX, 1762);

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

/** Returns "shared" | "downloaded" (fallback) | "copy" (no file-share support). */
export async function shareRoastCard(canvas: HTMLCanvasElement): Promise<"shared" | "downloaded" | "copy"> {
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return "copy";
  const file = new File([blob], "euphex-roast.png", { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Euphex Roast Card" });
      return "shared";
    }
  } catch {
    return "copy";
  }
  downloadCanvas(canvas, "euphex-roast.png");
  return "downloaded";
}
