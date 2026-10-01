import Script from "next/script";

/**
 * Cloudflare Web Analytics beacon for static export.
 * Set NEXT_PUBLIC_CF_BEACON_TOKEN in Cloudflare Pages env vars.
 * Get it from: Cloudflare dashboard → Analytics & Logs → Web Analytics → Add site → euphex.mv
 * No token = renders nothing (use dashboard auto-inject as fallback).
 */
export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
      strategy="afterInteractive"
    />
  );
}
