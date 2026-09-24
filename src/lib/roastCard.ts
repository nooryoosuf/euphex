"use client";
// Renders the roast as a 1080×1920 story image (Instagram / TikTok / Discord)
// on a <canvas>: hero splash + dark cinematic overlay + Euphex branding.

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
  const PX = 90;

  // base
  ctx.fillStyle = "#07090D";
  ctx.fillRect(0, 0, W, H);

  // hero backdrop (top ~58%)
  const heroImg = art.heroImage ? await loadImage(art.heroImage) : null;
  if (heroImg) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, 1120);
    ctx.clip();
    cover(ctx, heroImg, 0, 0, W, 1120);
    ctx.restore();
  } else {
    const g0 = ctx.createLinearGradient(0, 0, W, 1120);
    g0.addColorStop(0, "#1a1030");
    g0.addColorStop(0.55, "#3d1548");
    g0.addColorStop(1, "#07090D");
    ctx.fillStyle = g0;
    ctx.fillRect(0, 0, W, 1120);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.font = "900 420px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(art.hero.slice(0, 2).toUpperCase(), W / 2, 760);
  }
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "rgba(7,9,13,0.25)");
  g.addColorStop(0.42, "rgba(7,9,13,0.55)");
  g.addColorStop(0.58, "#07090D");
  g.addColorStop(1, "#07090D");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // top brand bar
  ctx.fillStyle = "#E3256B";
  ctx.fillRect(PX, 84, 120, 10);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 44px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("EUPHEX", PX, 170);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText("ROAST  CARD  ·  EUPHEX.GG/ROAST", PX, 212);

  // associated hero
  ctx.fillStyle = "#E3256B";
  ctx.font = "700 30px system-ui, sans-serif";
  ctx.fillText(`CERTIFIED ${art.role.toUpperCase()}  ·  ${art.hero.toUpperCase()} PLAYER`, PX, 1010);

  // title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 92px system-ui, sans-serif";
  const titleLines = wrap(ctx, `${art.title} 💀`, W - PX * 2);
  let y = 1120;
  for (const l of titleLines) {
    ctx.fillText(l, PX, y);
    y += 104;
  }

  // roast body
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = "500 40px system-ui, sans-serif";
  const lines = wrap(ctx, art.roast, W - PX * 2);
  y += 30;
  for (const l of lines) {
    if (l === "") {
      y += 22;
      continue;
    }
    if (y > 1620) break;
    ctx.fillText(l, PX, y);
    y += 58;
  }

  // footer
  ctx.fillStyle = "#E3256B";
  ctx.fillRect(PX, 1660, W - PX * 2, 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 38px system-ui, sans-serif";
  ctx.fillText(`${art.name.toUpperCase()}  ·  ${art.level.toUpperCase()} ROAST`, PX, 1724);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText("SHARE YOUR L  ·  EUPHEX.GG/ROAST", PX, 1770);

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
