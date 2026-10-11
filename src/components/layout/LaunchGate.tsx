"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";

/**
 * Launch-mode gate (static-export friendly — middleware can't run here).
 * While siteConfig.launch.enabled, every route except / and /admin/*
 * bounces to the countdown screen. Dashboard access is preserved.
 */
export function LaunchGate() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (
      siteConfig.launch.enabled &&
      pathname !== "/" &&
      !pathname?.startsWith("/admin")
    ) {
      router.replace("/");
    }
  }, [pathname, router]);
  return null;
}
