"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function getCleanReferrer(): string {
  if (typeof document === "undefined" || !document.referrer) return "direct";
  try {
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return "direct";
    if (url.hostname.includes("instagram")) return "Instagram";
    if (url.hostname.includes("tiktok")) return "TikTok";
    if (url.hostname.includes("google")) return "Google";
    if (url.hostname.includes("facebook")) return "Facebook";
    if (url.hostname.includes("twitter") || url.hostname.includes("x.com")) return "X / Twitter";
    if (url.hostname.includes("discord")) return "Discord";
    if (url.hostname.includes("youtube")) return "YouTube";
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "external";
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") return "anon";
  try {
    let sid = sessionStorage.getItem("ephx_sid");
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem("ephx_sid", sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

export function PageviewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Ignore admin pages so dashboard use doesn't skew public traffic
    if (!pathname || pathname.startsWith("/admin")) return;
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const sb = supabase();
    if (!sb) return;

    const payload = {
      path: pathname,
      referrer: getCleanReferrer(),
      device: getDeviceType(),
      session_id: getSessionId(),
    };

    // Fire and forget, completely silent on errors
    void (async () => {
      try {
        await sb.from("pageviews").insert(payload);
      } catch {
        // Silently ignore if table doesn't exist or offline
      }
    })();
  }, [pathname]);

  return null;
}
