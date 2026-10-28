"use client";

import React from "react";
import Link from "next/link";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function renderHyperlink(text: React.ReactNode, rawHref: string, key: string | number) {
  const href = normalizeUrl(rawHref);
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link
        key={key}
        href={href}
        className="text-[var(--accent)] underline decoration-[var(--accent)]/60 underline-offset-4 hover:text-white hover:decoration-white font-medium transition-colors cursor-pointer"
      >
        {text}
      </Link>
    );
  }

  return (
    <a
      key={key}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--accent)] underline decoration-[var(--accent)]/60 underline-offset-4 hover:text-white hover:decoration-white font-medium transition-colors cursor-pointer inline-flex items-baseline gap-0.5"
    >
      <span>{text}</span>
      <span className="text-[10px] opacity-70 font-mono" aria-hidden="true">↗</span>
    </a>
  );
}

function renderInline(text: string): React.ReactNode {
  // Regex to match:
  // 1. HTML links: <a href="...">...</a>
  // 2. Markdown links: [text](url)
  // 3. Bold: **text**
  // 4. Italic: *text* or _text_
  // 5. Code: `code`
  // 6. Raw URLs: https://... or http://... or www....
  const TOKEN_REGEX = /(<a\s+[^>]*href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`|https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
  const parts = text.split(TOKEN_REGEX);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. HTML link: <a href="url">text</a>
    if (part.startsWith("<a ") && part.endsWith("</a>")) {
      const href = part.match(/href=["']([^"']+)["']/i)?.[1] ?? "";
      const innerText = part.replace(/<[^>]+>/g, "");
      return renderHyperlink(innerText || href, href, index);
    }

    // 2. Markdown link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, linkText, url] = linkMatch;
      return renderHyperlink(linkText, url, index);
    }

    // 3. Raw URLs: https://... or www....
    if (/^(https?:\/\/|www\.)/i.test(part)) {
      const trailingPunctuation = part.match(/[.,!?:;)]+$/)?.[0] || "";
      const cleanUrl = part.slice(0, part.length - trailingPunctuation.length);
      return (
        <React.Fragment key={index}>
          {renderHyperlink(cleanUrl, cleanUrl, `link-${index}`)}
          {trailingPunctuation}
        </React.Fragment>
      );
    }

    // 4. Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 5. Italic: *text* or _text_
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      return (
        <em key={index} className="italic text-white/95">
          {part.slice(1, -1)}
        </em>
      );
    }

    // 6. Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={index} className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-[var(--accent)] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

export function RichArticleBody({
  body,
  firstLead = true,
}: {
  body: string[];
  firstLead?: boolean;
}) {
  const visible = (body || []).filter((p) => typeof p === "string" && !p.trim().startsWith("<!-- cover:"));

  if (!visible.length) {
    return <p className="italic text-white/40">No content provided.</p>;
  }

  return (
    <div className="space-y-6">
      {visible.map((p, i) => {
        const trimmed = p.trim();

        // H1: # Heading
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="font-display mt-10 mb-4 text-3xl md:text-5xl font-bold tracking-tight text-white border-b border-white/8 pb-3">
              {renderInline(trimmed.slice(2))}
            </h2>
          );
        }

        // H2: ## Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="font-display mt-8 mb-3 text-2xl md:text-3xl font-bold tracking-tight text-white">
              {renderInline(trimmed.slice(3))}
            </h3>
          );
        }

        // H3: ### Heading
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="font-display mt-6 mb-2 text-xl md:text-2xl font-bold tracking-tight text-white/90">
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }

        // Blockquote: > Quote
        if (trimmed.startsWith("> ")) {
          const quoteLines = trimmed.split("\n").map((l) => l.replace(/^>\s*/, "")).join(" ");
          return (
            <blockquote key={i} className="my-6 border-l-2 border-[var(--accent)] pl-5 italic text-xl md:text-2xl leading-relaxed text-white/90 bg-white/[0.02] py-4 pr-4">
              “{renderInline(quoteLines)}”
            </blockquote>
          );
        }

        // Image: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const [, alt, src] = imgMatch;
          return (
            <figure key={i} className="my-8 overflow-hidden rounded border border-white/10 bg-[#0C0F16]">
              <img src={src} alt={alt || ""} className="w-full max-h-[550px] object-cover" />
              {alt && <figcaption className="p-3 text-center text-xs text-white/45">{alt}</figcaption>}
            </figure>
          );
        }

        // Bullet list (lines starting with - or *)
        const lines = trimmed.split("\n");
        if (lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          const items = lines.map((l) => l.replace(/^\s*[-*]\s+/, ""));
          return (
            <ul key={i} className="my-5 list-disc space-y-2 pl-6 text-white/75 leading-relaxed">
              {items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }

        // Standard paragraph
        return (
          <p
            key={i}
            className={`leading-relaxed text-white/75 ${
              firstLead && i === 0 ? "text-xl md:text-2xl text-white/90 font-light" : "text-base md:text-lg"
            }`}
          >
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
