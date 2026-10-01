"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, Search, Download, Upload, LogOut, RefreshCw } from "lucide-react";
import type {
  Match, MediaItem, NewsArticle, Player, Team, TimelineEvent, Tournament,
} from "@/data/types";
import {
  supabase, fetchLiveContent, seedBundle,
  playerToRow, teamToRow, matchToRow, tournamentToRow,
  newsToRow, mediaToRow, timelineToRow,
} from "@/lib/supabase";
import { Sheet, useConfirm } from "./ui";
import { ScrimsInbox } from "./ScrimsInbox";
import { RecruitsInbox } from "./RecruitsInbox";
import {
  PlayerEditor, TeamEditor, MatchEditor, TournamentEditor,
  NewsEditor, MediaEditor, TimelineEditor,
} from "./editors";
import { EuphexLogo } from "@/components/ui/TeamLogos";
import { cn } from "@/lib/utils";

type Tab = "players" | "teams" | "matches" | "tournaments" | "news" | "media" | "timeline" | "scrims" | "recruits";

const TABS: { id: Tab; label: string }[] = [
  { id: "players", label: "Players" },
  { id: "teams", label: "Teams" },
  { id: "matches", label: "Matches" },
  { id: "tournaments", label: "Tournaments" },
  { id: "news", label: "News" },
  { id: "media", label: "Media" },
  { id: "timeline", label: "Timeline" },
  { id: "scrims", label: "Scrims" },
  { id: "recruits", label: "Recruits" },
];

type TLRow = TimelineEvent & { id?: number };

interface Working {
  players: Player[];
  teams: Team[];
  matches: Match[];
  tournaments: Tournament[];
  news: NewsArticle[];
  media: MediaItem[];
  timeline: TLRow[];
}

const TABLE_OF: Record<string, string> = {
  players: "players", teams: "teams", matches: "matches",
  tournaments: "tournaments", news: "news", media: "media", timeline: "timeline",
};
const PK_OF: Record<string, string> = {
  players: "slug", teams: "slug", matches: "id",
  tournaments: "slug", news: "slug", media: "id", timeline: "id",
};

const asRecs = (v: unknown): Record<string, unknown>[] => v as unknown as Record<string, unknown>[];

export function AdminApp() {
  const [user, setUser] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [tab, setTab] = useState<Tab>("players");
  const [work, setWork] = useState<Working | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ tab: Tab; id: string | null } | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const { ask, node: confirmNode } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  // session
  useEffect(() => {
    supabase()?.auth.getSession().then(({ data }) => {
      setUser(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase()?.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user?.email ?? null);
    }) ?? { data: null };
    return () => { sub?.subscription.unsubscribe(); };
  }, []);

  const load = async () => {
    setLoading(true);
    const live = await fetchLiveContent();
    const base = live ?? seedBundle();
    // keep timeline ids for updates/deletes
    let timeline: TLRow[] = base.timeline;
    try {
      const sb = supabase();
      if (sb) {
        const { data } = await sb.from("timeline").select("*").order("id");
        if (data) timeline = data.map((r) => ({ ...(r as TLRow) }));
      }
    } catch { /* keep seed */ }
    setWork({ ...base, timeline });
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErr("");
    const sb = supabase();
    if (!sb) {
      setAuthErr("Supabase is not configured (missing env).");
      return;
    }
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setAuthErr(error.message);
  };

  const signOut = async () => {
    await supabase()?.auth.signOut();
    setWork(null);
  };

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <EuphexLogo className="h-14 w-auto text-white" />
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight">DASHBOARD.</h1>
        <p className="mt-2 text-sm text-white/50">Sign in to manage the site. Saving goes live instantly.</p>
        <form className="mt-8 w-full space-y-3" onSubmit={signIn}>
          <input
            type="email" value={email} onChange={(e) => { setEmail(e.target.value); setAuthErr(""); }}
            placeholder="Email" aria-label="Email" autoComplete="username"
            className="w-full border border-white/15 bg-black/40 px-4 py-3.5 text-center placeholder:text-white/25 focus:outline-none focus:border-[var(--accent)]"
          />
          <input
            type="password" value={password} onChange={(e) => { setPassword(e.target.value); setAuthErr(""); }}
            placeholder="Password" aria-label="Password" autoComplete="current-password"
            className="w-full border border-white/15 bg-black/40 px-4 py-3.5 text-center placeholder:text-white/25 focus:outline-none focus:border-[var(--accent)]"
          />
          {authErr && <p className="text-sm text-red-300">{authErr}</p>}
          <button className="w-full bg-[var(--accent)] py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 cursor-pointer">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const teamSlugs = (work?.teams ?? []).map((t) => t.slug);

  const openNew = (t: Tab) => {
    const blanks: Record<string, Record<string, unknown>> = {
      players: { slug: "new-player", gamertag: "NEW", realName: "", role: "Jungle", teamSlug: teamSlugs[0] ?? "euphex", country: "", countryCode: "", joined: "", matches: 0, winRate: 50, mvps: 0, quote: "", playstyle: "", signatureMove: "", favoriteHero: "", hue: 220, number: 99, heroPool: [], achievements: [] },
      teams: { slug: "new-team", name: "NEW TEAM", shortName: "NEW", tier: "SECOND", index: "03", verb: "PROVE", tagline: "", description: "", playstyle: [], hue: 220, founded: 2026, wins: 0, losses: 0, championships: 0, achievements: [] },
      matches: { id: "new-match", tournamentSlug: "", tournamentName: "", stage: "", teamSlug: teamSlugs[0] ?? "euphex", opponent: "", opponentShort: "", date: new Date().toISOString().slice(0, 16) + ":00", status: "upcoming" },
      tournaments: { slug: "new-tournament", name: "NEW TOURNAMENT", stage: "", status: "UPCOMING", date: "", hue: 220, description: "", teamSlugs: [] },
      news: { slug: "new-article", category: "TEAM", title: "", excerpt: "", date: new Date().toISOString().slice(0, 10), readMinutes: 3, hue: 220, body: [] },
      media: { id: "m-new", category: "TEAM", title: "", hue: 220 },
      timeline: { year: "2026", title: "", text: "" },
    };
    setDraft(blanks[t]);
    setEditing({ tab: t, id: null });
  };

  const openEdit = (t: Tab, id: string) => {
    if (!work) return;
    const item = asRecs(work[t as keyof Working]).find((x) =>
      t === "matches" ? x.id === id : t === "media" ? x.id === id
      : t === "timeline" ? String((x as { id?: number }).id ?? `${x.year}-${x.title}`) === id
      : (x as { slug?: string }).slug === id,
    );
    if (!item) return;
    setDraft(structuredClone(item));
    setEditing({ tab: t, id });
  };

  const rowOf = (t: Tab, d: Record<string, unknown>) => {
    switch (t) {
      case "players": return playerToRow(d as unknown as Player);
      case "teams": return teamToRow(d as unknown as Team);
      case "matches": return matchToRow(d as unknown as Match);
      case "tournaments": return tournamentToRow(d as unknown as Tournament);
      case "news": return newsToRow(d as unknown as NewsArticle);
      case "media": return mediaToRow(d as unknown as MediaItem);
      case "timeline": return timelineToRow(d as unknown as TLRow);
      default: throw new Error("bad tab");
    }
  };

  const saveDraft = async () => {
    if (!editing || !draft || !work) return;
    const t = editing.tab;
    const key = t as keyof Working;
    setBusy(true);
    try {
      const sb = supabase();
      if (!sb) throw new Error("Supabase is not configured.");
      const row = rowOf(t, draft);
      if (t === "timeline" && editing.id === null) {
        // insert new (id assigned by db)
        const { data, error } = await sb.from("timeline").insert(row).select().single();
        if (error) throw error;
        const withId = { ...(draft as unknown as TLRow), id: (data as { id: number }).id };
        setWork((w) => (w ? { ...w, timeline: [...w.timeline, withId] } : w));
      } else if (t === "timeline") {
        const id = Number(editing.id);
        const { error } = await sb.from("timeline").update(row).eq("id", id);
        if (error) throw error;
        setWork((w) => (w ? { ...w, timeline: w.timeline.map((x) => (x.id === id ? { ...(draft as unknown as TLRow), id } : x)) } : w));
      } else {
        const pk = PK_OF[t];
        const { error } = await sb.from(TABLE_OF[t]).upsert(row, { onConflict: pk });
        if (error) throw error;
        setWork((w) => {
          if (!w) return w;
          const list = [...asRecs(w[key])];
          const finder = (x: Record<string, unknown>) =>
            t === "matches" || t === "media" ? x.id === editing.id || (editing.id === null && (x.slug ?? x.id) === (draft.slug ?? draft.id)) : (x as { slug?: string }).slug === (editing.id ?? (draft.slug as string));
          const i = editing.id === null ? -1 : list.findIndex(finder);
          if (i >= 0) list[i] = draft;
          else list.push(draft);
          return { ...w, [key]: list };
        });
      }
      setLog((l) => [`✓ saved ${t} → live now`, ...l].slice(0, 8));
    } catch (e) {
      setLog((l) => [`✗ save failed: ${e instanceof Error ? e.message : "failed"}`, ...l].slice(0, 8));
      setBusy(false);
      return;
    }
    setEditing(null);
    setDraft(null);
    setBusy(false);
  };

  const removeItem = (t: Tab, id: string) => {
    const sb = supabase();
    if (!sb || !work) return;
    const key = t as keyof Working;
    const apply = () => {
      setWork((w) => {
        if (!w) return w;
        const filtered = asRecs(w[key]).filter((x) =>
          t === "matches" || t === "media" ? x.id !== id
          : t === "timeline" ? String((x as { id?: number }).id ?? `${x.year}-${x.title}`) !== id
          : (x as { slug?: string }).slug !== id,
        );
        return { ...w, [key]: filtered };
      });
    };
    (async () => {
      try {
        if (t === "timeline") {
          const num = Number(id);
          if (Number.isFinite(num)) {
            const { error } = await sb.from("timeline").delete().eq("id", num);
            if (error) throw error;
          } else {
            const [year, ...rest] = id.split("-");
            const { error } = await sb.from("timeline").delete().eq("year", year).eq("title", rest.join("-"));
            if (error) throw error;
          }
        } else {
          const { error } = await sb.from(TABLE_OF[t]).delete().eq(PK_OF[t], id);
          if (error) throw error;
        }
        apply();
        setLog((l) => [`✓ deleted ${t}/${id} → live now`, ...l].slice(0, 8));
      } catch (e) {
        setLog((l) => [`✗ delete failed: ${e instanceof Error ? e.message : "failed"}`, ...l].slice(0, 8));
      }
    })();
  };

  const ql = q.toLowerCase();
  const matchQ = (s: string) => s.toLowerCase().includes(ql);

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <EuphexLogo className="h-9 w-auto text-white" />
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">DASHBOARD.</h1>
            <p className="text-xs text-white/40">Saving goes live instantly · {user}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-[12px] font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white cursor-pointer"
          >
            <RefreshCw className="size-4" /> Reload live
          </button>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-[12px] font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white cursor-pointer"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </header>

      {log.length > 0 && (
        <div className="mt-4 border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap" role="status">
          {log.join("\n")}
        </div>
      )}

      {/* tabs */}
      <div className="sticky top-16 md:top-20 z-30 -mx-4 md:mx-0 mt-6 border-y border-white/8 bg-[#07090D]/95 backdrop-blur-md" role="tablist" aria-label="Collections">
        <div className="flex gap-1 overflow-x-auto px-4 md:px-0 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setQ("");
              }}
              className={cn(
                "shrink-0 px-4 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase cursor-pointer transition-all",
                tab === t.id ? "bg-white text-black" : "text-white/50 hover:text-white",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !work ? (
        <p className="py-20 text-center text-sm text-white/40">Loading live data…</p>
      ) : tab === "scrims" ? (
        <section className="mt-6" aria-label="Scrim requests">
          <ScrimsInbox />
        </section>
      ) : tab === "recruits" ? (
        <section className="mt-6" aria-label="Recruitment applications">
          <RecruitsInbox />
        </section>
      ) : (
        <section className="mt-6" aria-label={tab}>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="flex flex-1 items-center gap-2 border border-white/12 px-3.5 py-2.5">
              <Search className="size-4 text-white/35" />
              <span className="sr-only">Search {tab}</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${tab}…`} className="w-full bg-transparent text-sm placeholder:text-white/30 focus:outline-none" />
            </label>
            <button onClick={() => openNew(tab)} className="inline-flex items-center justify-center gap-2 bg-white px-5 py-2.5 text-[12px] font-bold tracking-[0.16em] uppercase text-black hover:bg-[var(--accent)] hover:text-white cursor-pointer transition-colors">
              <Plus className="size-4" /> New
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <ListBody tab={tab} work={work} ql={ql} matchQ={matchQ} openEdit={openEdit} ask={ask} removeItem={removeItem} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(work, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "euphex-backup.json";
                a.click();
              }}
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-3 text-xs font-bold tracking-[0.16em] uppercase text-white/70 hover:text-white cursor-pointer"
            >
              <Download className="size-4" /> Backup JSON
            </button>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center justify-center gap-2 border border-white/15 px-4 py-3 text-xs font-bold tracking-[0.16em] uppercase text-white/70 hover:text-white cursor-pointer">
              <Upload className="size-4" /> View backup <span className="normal-case tracking-normal opacity-60">(reference only)</span>
            </button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { e.target.value = ""; setLog((l) => ["Backups are reference-only — edit above to change the live site.", ...l].slice(0, 8)); }} />
          </div>
        </section>
      )}

      {editing && draft && (
        <Sheet
          title={editing.id === null ? `New ${editing.tab.slice(0, -1)}` : `Edit ${editing.tab.slice(0, -1)}`}
          onClose={() => {
            setEditing(null);
            setDraft(null);
          }}
          onSave={saveDraft}
        >
          <EditorBody tab={editing.tab} draft={draft} setDraft={setDraft} teamSlugs={teamSlugs} />
        </Sheet>
      )}
      {confirmNode}
      {busy && <p className="mt-4 text-center text-xs text-white/40" role="status">Saving…</p>}
    </div>
  );
}

function rowCls() {
  return "flex items-center justify-between gap-3 border border-white/8 bg-[#0C0F16] p-4 hover:border-[var(--accent)]/40 cursor-pointer transition-colors text-left w-full";
}

function tid(x: Record<string, unknown>): string {
  return String((x as { id?: number }).id ?? `${x.year}-${x.title}`);
}

function ListBody({ tab, work, ql, matchQ, openEdit, ask, removeItem }: {
  tab: Tab; work: Working; ql: string; matchQ: (s: string) => boolean;
  openEdit: (t: Tab, id: string) => void;
  ask: (m: string, f: () => void) => void;
  removeItem: (t: Tab, id: string) => void;
}) {
  if (tab === "players") {
    const list = work.players.filter((p) => !ql || matchQ(`${p.gamertag} ${p.realName} ${p.role} ${p.teamSlug}`));
    return <>{list.map((p) => (
      <div key={p.slug} className="flex items-stretch gap-2">
        <button onClick={() => openEdit("players", p.slug)} className={rowCls()}>
          <span><span className="font-display text-xl font-bold">{p.gamertag}</span>
            <span className="block text-xs text-white/45">{p.role} · {p.teamSlug} · {p.heroPool.length} heroes</span></span>
          <span className="text-xs text-white/30">Edit →</span>
        </button>
        <button onClick={() => ask(`Delete player ${p.gamertag}?`, () => removeItem("players", p.slug))} aria-label={`Delete ${p.gamertag}`} className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
      </div>
    ))}{list.length === 0 && <Empty />}</>;
  }
  if (tab === "teams") {
    const list = work.teams.filter((t) => !ql || matchQ(`${t.name} ${t.shortName}`));
    return <>{list.map((t) => (
      <div key={t.slug} className="flex items-stretch gap-2">
        <button onClick={() => openEdit("teams", t.slug)} className={rowCls()}>
          <span><span className="font-display text-xl font-bold">{t.name}</span>
            <span className="block text-xs text-white/45">{t.tier} · {t.wins}–{t.losses} · {t.championships} titles</span></span>
          <span className="text-xs text-white/30">Edit →</span>
        </button>
        <button onClick={() => ask(`Delete team ${t.name}? Players on it become orphaned — reassign them first.`, () => removeItem("teams", t.slug))} aria-label={`Delete ${t.name}`} className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
      </div>
    ))}{list.length === 0 && <Empty />}</>;
  }
  if (tab === "matches") {
    const list = work.matches.filter((m) => !ql || matchQ(`${m.tournamentName} ${m.opponent} ${m.stage}`));
    return <>{list.map((m) => (
      <div key={m.id} className="flex items-stretch gap-2">
        <button onClick={() => openEdit("matches", m.id)} className={rowCls()}>
          <span><span className="font-display text-lg font-bold">{m.tournamentName} — {m.stage}</span>
            <span className="block text-xs text-white/45">vs {m.opponent} · {m.status}{m.scoreUs != null ? ` · ${m.scoreUs}–${m.scoreThem}` : ""}</span></span>
          <span className="text-xs text-white/30">Edit →</span>
        </button>
        <button onClick={() => ask(`Delete match vs ${m.opponent}?`, () => removeItem("matches", m.id))} aria-label="Delete match" className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
      </div>
    ))}{list.length === 0 && <Empty />}</>;
  }
  if (tab === "tournaments") {
    const list = work.tournaments.filter((t) => !ql || matchQ(t.name));
    return <>{list.map((t) => (
      <div key={t.slug} className="flex items-stretch gap-2">
        <button onClick={() => openEdit("tournaments", t.slug)} className={rowCls()}>
          <span><span className="font-display text-xl font-bold">{t.name}</span>
            <span className="block text-xs text-white/45">{t.status} · {t.stage}</span></span>
          <span className="text-xs text-white/30">Edit →</span>
        </button>
        <button onClick={() => ask(`Delete tournament ${t.name}?`, () => removeItem("tournaments", t.slug))} aria-label={`Delete ${t.name}`} className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
      </div>
    ))}{list.length === 0 && <Empty />}</>;
  }
  if (tab === "news") {
    const list = work.news.filter((a) => !ql || matchQ(`${a.title} ${a.category}`));
    return <>{list.map((a) => (
      <div key={a.slug} className="flex items-stretch gap-2">
        <button onClick={() => openEdit("news", a.slug)} className={rowCls()}>
          <span><span className="font-display text-lg font-bold leading-tight block">{a.title}</span>
            <span className="block text-xs text-white/45 mt-1">{a.category} · {a.date}</span></span>
          <span className="text-xs text-white/30 shrink-0">Edit →</span>
        </button>
        <button onClick={() => ask(`Delete article?`, () => removeItem("news", a.slug))} aria-label="Delete article" className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
      </div>
    ))}{list.length === 0 && <Empty />}</>;
  }
  if (tab === "media") {
    const list = work.media.filter((m) => !ql || matchQ(`${m.title} ${m.category}`));
    return <>{list.map((m) => (
      <div key={m.id} className="flex items-stretch gap-2">
        <button onClick={() => openEdit("media", m.id)} className={rowCls()}>
          <span><span className="font-display text-lg font-bold">{m.title}</span>
            <span className="block text-xs text-white/45">{m.category}</span></span>
          <span className="text-xs text-white/30">Edit →</span>
        </button>
        <button onClick={() => ask(`Delete media item?`, () => removeItem("media", m.id))} aria-label="Delete media" className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
      </div>
    ))}{list.length === 0 && <Empty />}</>;
  }
  const list = work.timeline.filter((t) => !ql || matchQ(`${t.year} ${t.title}`));
  return <>{list.map((t, i) => (
    <div key={`${t.id ?? i}`} className="flex items-stretch gap-2">
      <button onClick={() => openEdit("timeline", tid(t as unknown as Record<string, unknown>))} className={rowCls()}>
        <span><span className="font-display text-xl font-bold">{t.year} — {t.title}</span>
          <span className="block text-xs text-white/45">{t.text}</span></span>
        <span className="text-xs text-white/30">Edit →</span>
      </button>
      <button onClick={() => ask(`Delete timeline entry?`, () => removeItem("timeline", tid(t as unknown as Record<string, unknown>)))} aria-label="Delete entry" className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
    </div>
  ))}{list.length === 0 && <Empty />}</>;
}

function Empty() {
  return <p className="py-10 text-center text-sm text-white/40">Nothing here. Hit New to add one.</p>;
}

function EditorBody({ tab, draft, setDraft, teamSlugs }: {
  tab: Tab; draft: Record<string, unknown>; setDraft: (d: Record<string, unknown>) => void; teamSlugs: string[];
}) {
  const c = (patch: Record<string, unknown>) => setDraft({ ...draft, ...patch });
  if (tab === "players") return <PlayerEditor value={draft as unknown as Player} onChange={c as (p: Partial<Player>) => void} teamSlugs={teamSlugs} />;
  if (tab === "teams") return <TeamEditor value={draft as unknown as Team} onChange={c as (p: Partial<Team>) => void} />;
  if (tab === "matches") return <MatchEditor value={draft as unknown as Match} onChange={c as (p: Partial<Match>) => void} teamSlugs={teamSlugs} />;
  if (tab === "tournaments") return <TournamentEditor value={draft as unknown as Tournament} onChange={c as (p: Partial<Tournament>) => void} />;
  if (tab === "news") return <NewsEditor value={draft as unknown as NewsArticle} onChange={c as (p: Partial<NewsArticle>) => void} />;
  if (tab === "media") return <MediaEditor value={draft as unknown as MediaItem} onChange={c as (p: Partial<MediaItem>) => void} />;
  return <TimelineEditor value={draft as unknown as TimelineEvent} onChange={c as (p: Partial<TimelineEvent>) => void} />;
}
