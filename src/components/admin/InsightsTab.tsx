"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Smartphone,
  Monitor,
  ExternalLink,
  RefreshCw,
  Download,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { NewsArticle, Player, Team, Tournament } from "@/data/types";
import Link from "next/link";

interface PageviewRow {
  id: number;
  path: string;
  referrer: string | null;
  device: string | null;
  session_id: string | null;
  created_at: string;
}

type TimeRange = "today" | "7d" | "30d" | "all";

export function InsightsTab({
  news = [],
  players = [],
  teams = [],
  tournaments = [],
}: {
  news?: NewsArticle[];
  players?: Player[];
  teams?: Team[];
  tournaments?: Tournament[];
}) {
  const [rows, setRows] = useState<PageviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>("all");
  const [tableExists, setTableExists] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const sb = supabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await sb
        .from("pageviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3000);

      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setTableExists(false);
        }
        setRows([]);
      } else {
        setTableExists(true);
        setRows((data as PageviewRow[]) || []);
      }
    } catch {
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Filter rows by selected timeframe
  const filteredRows = useMemo(() => {
    if (range === "all") return rows;
    const now = Date.now();
    const cutoffs: Record<TimeRange, number> = {
      today: now - 24 * 60 * 60 * 1000,
      "7d": now - 7 * 24 * 60 * 60 * 1000,
      "30d": now - 30 * 24 * 60 * 60 * 1000,
      all: 0,
    };
    const cutoff = cutoffs[range];
    return rows.filter((r) => +new Date(r.created_at) >= cutoff);
  }, [rows, range]);

  // Aggregate metrics
  const totalViews = filteredRows.length;
  const uniqueSessions = new Set(filteredRows.map((r) => r.session_id || r.id)).size;

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return rows.filter((r) => r.created_at?.startsWith(today)).length;
  }, [rows]);

  // Devices
  const deviceCounts = useMemo(() => {
    const counts = { mobile: 0, desktop: 0, tablet: 0 };
    for (const r of filteredRows) {
      const d = (r.device || "desktop").toLowerCase();
      if (d === "mobile") counts.mobile++;
      else if (d === "tablet") counts.tablet++;
      else counts.desktop++;
    }
    return counts;
  }, [filteredRows]);

  const mobilePct = totalViews ? Math.round(((deviceCounts.mobile + deviceCounts.tablet) / totalViews) * 100) : 0;
  const desktopPct = totalViews ? Math.round((deviceCounts.desktop / totalViews) * 100) : 0;

  // Top Pages
  const topPages = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filteredRows) {
      const cleanPath = r.path.replace(/\/+$/, "") || "/";
      map.set(cleanPath, (map.get(cleanPath) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRows]);

  // Top Referrers
  const topReferrers = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filteredRows) {
      const ref = r.referrer || "direct";
      map.set(ref, (map.get(ref) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRows]);

  // Human friendly labels for paths
  const resolvePageName = (path: string): { label: string; badge: string } => {
    if (path === "/" || path === "") return { label: "Homepage", badge: "HOME" };
    if (path === "/news") return { label: "News Wire (All)", badge: "NEWS" };
    if (path === "/players") return { label: "Players Roster", badge: "PLAYERS" };
    if (path === "/teams") return { label: "Teams Overview", badge: "TEAMS" };
    if (path === "/tournaments") return { label: "Tournaments Index", badge: "EVENTS" };
    if (path === "/matches") return { label: "Matches Schedule & Results", badge: "MATCHES" };

    if (path.startsWith("/news/")) {
      const slug = path.replace("/news/", "");
      const article = news.find((n) => n.slug === slug);
      return { label: article?.title ? article.title : slug, badge: "NEWS" };
    }

    if (path.startsWith("/players/")) {
      const slug = path.replace("/players/", "");
      const player = players.find((p) => p.slug === slug);
      return { label: player?.gamertag ? `${player.gamertag} (${player.realName || player.role})` : slug, badge: "PLAYER" };
    }

    if (path.startsWith("/teams/")) {
      const slug = path.replace("/teams/", "");
      const team = teams.find((t) => t.slug === slug);
      return { label: team?.name ? team.name : slug, badge: "TEAM" };
    }

    if (path.startsWith("/tournaments/")) {
      const slug = path.replace("/tournaments/", "");
      const tourney = tournaments.find((t) => t.slug === slug);
      return { label: tourney?.name ? tourney.name : slug, badge: "TOURNAMENT" };
    }

    return { label: path, badge: "PAGE" };
  };

  const sqlSetupScript = `-- Run this in your Supabase SQL Editor to enable traffic analytics:
create table if not exists pageviews (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  device text default 'desktop',
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pageviews_path on pageviews (path);
create index if not exists idx_pageviews_created_at on pageviews (created_at);

alter table pageviews enable row level security;

create policy "Allow anonymous pageview logging"
  on pageviews for insert
  with check (true);

create policy "Allow reading pageviews"
  on pageviews for select
  using (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const exportCsv = () => {
    if (!topPages.length) return;
    const header = "Path,Title,Views,Percent\n";
    const rowsCsv = topPages
      .map(({ path, count }) => {
        const { label } = resolvePageName(path);
        const pct = totalViews ? ((count / totalViews) * 100).toFixed(1) : "0";
        return `"${path}","${label.replace(/"/g, '""')}",${count},${pct}%`;
      })
      .join("\n");
    const blob = new Blob([header + rowsCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `euphex-traffic-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Time Controls & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="size-6 text-[var(--accent)]" />
            Website Traffic & Insights
          </h2>
          <p className="text-sm text-white/50 mt-0.5">
            Real-time visitor trends, most visited pages, and referral sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range pills */}
          <div className="flex rounded border border-white/10 bg-black/40 p-0.5 text-xs">
            {(
              [
                ["all", "All Time"],
                ["30d", "Last 30 Days"],
                ["7d", "Last 7 Days"],
                ["today", "Today"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={`px-3 py-1.5 font-bold rounded transition-colors cursor-pointer ${
                  range === key ? "bg-[var(--accent)] text-black font-semibold" : "text-white/50 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Refresh stats"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {topPages.length > 0 && (
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Download CSV"
            >
              <Download className="size-3.5" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* SQL Setup Notice if table does not exist */}
      {!tableExists && (
        <div className="border border-amber-400/30 bg-amber-400/5 p-5 rounded space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <span>⚠️</span> Activate Traffic Tracking in Supabase
              </p>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                The tracker is ready in the codebase! To start capturing visits, create the <code className="text-amber-200 font-mono">pageviews</code> table in your Supabase database by running this quick snippet in the Supabase SQL editor:
              </p>
            </div>
            <button
              type="button"
              onClick={copySql}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-400 text-black font-bold text-xs cursor-pointer hover:bg-amber-300 transition-colors shrink-0"
            >
              {copiedSql ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copiedSql ? "Copied!" : "Copy SQL Script"}
            </button>
          </div>
          <pre className="p-3 bg-black/60 rounded text-[11px] font-mono text-white/60 overflow-x-auto border border-white/10">
            {sqlSetupScript}
          </pre>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-white/8 bg-[#0C0F16] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="label !text-[10px] text-white/40">Total Views</span>
            <Eye className="size-4 text-[var(--accent)]" />
          </div>
          <p className="font-display mt-2 text-3xl font-bold tracking-tight">
            {totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {range === "all" ? "All tracked views" : `In selected timeframe (${range})`}
          </p>
        </div>

        <div className="border border-white/8 bg-[#0C0F16] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="label !text-[10px] text-white/40">Unique Sessions</span>
            <Users className="size-4 text-emerald-400" />
          </div>
          <p className="font-display mt-2 text-3xl font-bold tracking-tight">
            {uniqueSessions.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">Unique visitor sessions</p>
        </div>

        <div className="border border-white/8 bg-[#0C0F16] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="label !text-[10px] text-white/40">Today&apos;s Views</span>
            <TrendingUp className="size-4 text-cyan-400" />
          </div>
          <p className="font-display mt-2 text-3xl font-bold tracking-tight">
            {todayCount.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">Views captured today</p>
        </div>

        <div className="border border-white/8 bg-[#0C0F16] p-5 rounded">
          <div className="flex items-center justify-between">
            <span className="label !text-[10px] text-white/40">Device Breakdown</span>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Smartphone className="size-3.5 text-[var(--accent)]" />
              <Monitor className="size-3.5 text-white/70" />
            </div>
          </div>
          <p className="font-display mt-2 text-2xl font-bold tracking-tight">
            {mobilePct}% <span className="text-xs font-normal text-white/40">Mobile</span> · {desktopPct}% <span className="text-xs font-normal text-white/40">Desktop</span>
          </p>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3 flex">
            <div style={{ width: `${mobilePct}%` }} className="bg-[var(--accent)] h-full" />
            <div style={{ width: `${desktopPct}%` }} className="bg-white/40 h-full" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Top Pages & Referrers */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Ranked Top Pages Table */}
        <div className="border border-white/8 bg-[#0C0F16] rounded overflow-hidden">
          <div className="p-5 border-b border-white/8 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Most Visited Pages</h3>
              <p className="text-xs text-white/45 mt-0.5">Where your visitors spend the most time</p>
            </div>
            <span className="text-xs font-mono text-white/40">
              {topPages.length} unique URLs
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-white/40 animate-pulse">
              Loading analytics data...
            </div>
          ) : topPages.length === 0 ? (
            <div className="p-12 text-center text-sm text-white/40">
              {tableExists ? "No pageviews recorded yet in this timeframe." : "Table not set up in Supabase yet."}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {topPages.slice(0, 15).map(({ path, count }, index) => {
                const { label, badge } = resolvePageName(path);
                const pct = totalViews ? Math.round((count / totalViews) * 100) : 0;
                return (
                  <div key={path} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <span className="font-mono text-xs font-bold text-white/30 w-5 text-right shrink-0">
                      #{index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase shrink-0">
                          {badge}
                        </span>
                        <p className="font-bold text-sm text-white truncate" title={label}>
                          {label}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5">
                        <Link
                          href={path}
                          target="_blank"
                          className="font-mono text-[11px] text-white/40 hover:text-[var(--accent)] truncate flex items-center gap-1 transition-colors"
                        >
                          {path}
                          <ExternalLink className="size-2.5 opacity-60" />
                        </Link>
                      </div>

                      {/* Visual volume bar */}
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2">
                        <div
                          style={{ width: `${Math.max(pct, 2)}%` }}
                          className="bg-[var(--accent)]/80 h-full transition-all duration-500"
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-lg leading-tight">
                        {count.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-white/40">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Traffic Sources & Geo/Devices */}
        <div className="space-y-6">
          {/* Traffic Sources */}
          <div className="border border-white/8 bg-[#0C0F16] rounded overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <Globe className="size-4 text-[var(--accent)]" />
                  Traffic Sources
                </h3>
                <p className="text-xs text-white/45 mt-0.5">Where visitors are coming from</p>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-white/40 animate-pulse">Loading...</div>
            ) : topReferrers.length === 0 ? (
              <div className="p-8 text-center text-sm text-white/40">No referrer data yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {topReferrers.slice(0, 8).map(({ source, count }) => {
                  const pct = totalViews ? Math.round((count / totalViews) * 100) : 0;
                  return (
                    <div key={source} className="p-3.5 px-5 flex items-center justify-between hover:bg-white/[0.02]">
                      <div className="flex items-center gap-2.5">
                        <span className="size-2 rounded-full bg-[var(--accent)]/60" />
                        <span className="text-sm font-semibold text-white/85 capitalize">{source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-white/40">{pct}%</span>
                        <span className="font-bold text-sm text-white min-w-[32px] text-right">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Tip / Cloudflare Sync */}
          <div className="border border-white/8 bg-gradient-to-br from-white/[0.03] to-transparent p-5 rounded text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>🚀</span> Looking for geographic maps?
            </p>
            <p className="text-white/60 leading-relaxed">
              For deep country and city heatmaps (e.g. Male&apos;, Addu, Hulhumale&apos;), you can also check your <strong>Cloudflare Web Analytics</strong> dashboard at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
