"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";

/**
 * True while the launch lockdown is active: flag on AND date in the future.
 * When the countdown ends the site automatically restores itself —
 * no deploy, no flag flip needed.
 */
export function useLaunched() {
  const [launched, setLaunched] = useState<boolean>(siteConfig.launch.enabled);
  useEffect(() => {
    const t = setTimeout(() => {
      setLaunched(siteConfig.launch.enabled && Date.now() < +new Date(siteConfig.launch.date));
    }, 0);
    return () => clearTimeout(t);
  }, []);
  return launched;
}

/**
 * Launch-mode gate (static-export friendly — middleware can't run here).
 * While siteConfig.launch.enabled, every route except / and /admin/*
 * bounces to the countdown screen. Dashboard access is preserved.
 */
export function LaunchGate() {
  const pathname = usePathname();
  const router = useRouter();
  const launched = useLaunched();
  useEffect(() => {
    if (
      launched &&
      pathname !== "/" &&
      !pathname?.startsWith("/admin")
    ) {
      router.replace("/");
    }
  }, [pathname, router, launched]);
  return null;
}
