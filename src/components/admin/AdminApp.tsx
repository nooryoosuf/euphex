"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Plus, Search, Upload } from "lucide-react";
import type {
  Match, MediaItem, NewsArticle, Player, Team, TimelineEvent, Tournament,
} from "@/data/types";
import playersSeed from "@/data/players.json";
import teamsSeed from "@/data/teams.json";
import matchesSeed from "@/data/matches.json";
import tournamentsSeed from "@/data/tournaments.json";
import contentSeed from "@/data/content.json";
import { Sheet, useConfirm } from "./ui";
import {
  PlayerEditor, TeamEditor, MatchEditor, TournamentEditor,
  NewsEditor, MediaEditor, TimelineEditor,
} from "./editors";
import { EuphexLogo } from "@/components/ui/TeamLogos";
import { cn } from "@/lib/utils";

type Tab = "players" | "teams" | "matches" | "tournaments" | "news" | "media" | "timeline" | "publish";

const TABS: { id: Tab; label: string }[] = [
  { id: "players", label: "Players" },
  { id: "teams", label: "Teams" },
  { id: "matches", label: "Matches" },
  { id: "tournaments", label: "Tournaments" },
  { id: "news", label: "News" },
  { id: "media", label: "Media" },
  { id: "timeline", label: "Timeline" },
  { id: "publish", label: "Publish" },
];

interface Working {
  players: Player[];
  teams: Team[];
  matches: Match[];
  tournaments: Tournament[];
  news: NewsArticle[];
  media: MediaItem[];
  timeline: TimelineEvent[];
}

const seedOf = (): Working => ({
  players: structuredClone(playersSeed) as Player[],
  teams: structuredClone(teamsSeed) as Team[],
  matches: structuredClone(matchesSeed) as Match[],
  tournaments: structuredClone(tournamentsSeed) as Tournament[],
  news: structuredClone((contentSeed as { news: NewsArticle[] }).news),
  media: structuredClone((contentSeed as { media: MediaItem[] }).media),
  timeline: structuredClone((contentSeed as { timeline: TimelineEvent[] }).timeline),
});

const FILES: { key: keyof Working; path: string; label: string }[] = [
  { key: "players", path: "src/data/players.json", label: "Players" },
  { key: "teams", path: "src/data/teams.json", label: "Teams" },
  { key: "matches", path: "src/data/matches.json", label: "Matches" },
  { key: "tournaments", path: "src/data/tournaments.json", label: "Tournaments" },
  { key: "news", path: "src/data/content.json", label: "News / Media / Timeline" },
];

const canon = (v: unknown) => JSON.stringify(v);
const b64 = (s: string) => {
  const b = new TextEncoder().encode(s);
  let r = "";
  b.forEach((x) => (r += String.fromCharCode(x)));
  return btoa(r);
};

const PASSKEY = "euphex-admin-auth";
const DRAFTKEY = "euphex-admin-drafts";
const TOKENKEY = "euphex-admin-token";
const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "euphex2026";

const asRecs = (v: unknown): Record<string, unknown>[] => v as unknown as Record<string, unknown>[];

function contentPayload(w: Working) {
  return { news: w.news, media: w.media, timeline: w.timeline };
}

function fileBody(key: keyof Working, w: Working): string {
  const data = key === "news" || key === "media" || key === "timeline" ? contentPayload(w) : w[key];
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState(false);
  const [tab, setTab] = useState<Tab>("players");
  const [work, setWork] = useState<Working>(seedOf);
  const [restored, setRestored] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<{ tab: Tab; id: string | null } | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const { ask, node: confirmNode } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  // publish config
  const [owner, setOwner] = useState("nooryoosuf");
  const [repo, setRepo] = useState("euphex");
  const [branch, setBranch] = useState("main");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Update site content via admin");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(PASSKEY) === "1") setAuthed(true);
      const t = sessionStorage.getItem(TOKENKEY);
      if (t) setToken(t);
      const d = localStorage.getItem(DRAFTKEY);
      if (d) {
        const parsed = JSON.parse(d) as Working;
        if (parsed.players && parsed.teams) {
          setWork(parsed);
          setRestored(true);
        }
      }
    } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    if (!authed) return;
    try {
      localStorage.setItem(DRAFTKEY, JSON.stringify(work));
    } catch { /* ignore */ }
  }, [work, authed]);

  const changed = useMemo(() => {
    const base = seedOf();
    const out: typeof FILES = [];
    if (canon(work.players) !== canon(base.players)) out.push(FILES[0]);
    if (canon(work.teams) !== canon(base.teams)) out.push(FILES[1]);
    if (canon(work.matches) !== canon(base.matches)) out.push(FILES[2]);
    if (canon(work.tournaments) !== canon(base.tournaments)) out.push(FILES[3]);
    if (canon(contentPayload(work)) !== canon({ news: (contentSeed as { news: unknown }).news, media: (contentSeed as { media: unknown }).media, timeline: (contentSeed as { timeline: unknown }).timeline })) out.push(FILES[4]);
    return out;
  }, [work]);

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <EuphexLogo className="h-14 w-auto text-white" />
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight">DASHBOARD.</h1>
        <p className="mt-2 text-sm text-white/50">Restricted area. Enter the passcode.</p>
        <form
          className="mt-8 w-full space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (code === ADMIN_CODE) {
              setAuthed(true);
              try {
                sessionStorage.setItem(PASSKEY, "1");
              } catch { /* ignore */ }
            } else setCodeErr(true);
          }}
        >
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCodeErr(false);
            }}
            placeholder="Passcode"
            aria-label="Dashboard passcode"
            className="w-full border border-white/15 bg-black/40 px-4 py-3.5 text-center text-lg tracking-[0.3em] placeholder:text-white/25 focus:outline-none focus:border-[var(--accent)]"
          />
          {codeErr && <p className="text-sm text-red-300">Wrong code. Try again.</p>}
          <button className="w-full bg-[var(--accent)] py-3.5 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 cursor-pointer">
            Unlock
          </button>
        </form>
        <p className="mt-6 text-[11px] leading-relaxed text-white/35">
          Default code is <span className="text-white/60">euphex2026</span> — change it with
          NEXT_PUBLIC_ADMIN_CODE. The code is a screen door; real protection is your GitHub
          token, which never leaves this browser tab.
        </p>
      </div>
    );
  }

  const teamSlugs = work.teams.map((t) => t.slug);

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
    const item = asRecs(work[t as keyof Working]).find((x) =>
      t === "matches" ? x.id === id : t === "media" ? x.id === id : t === "timeline" ? `${x.year}-${x.title}` === id : (x as { slug?: string }).slug === id,
    );
    if (!item) return;
    setDraft(structuredClone(item));
    setEditing({ tab: t, id });
  };

  const saveDraft = () => {
    if (!editing || !draft) return;
    const key = editing.tab as keyof Working;
    setWork((w) => {
      const list = [...asRecs(w[key])];
      if (editing.id === null) {
        list.push(draft);
      } else {
        const i = list.findIndex((x) =>
          editing.tab === "matches" ? x.id === editing.id : editing.tab === "media" ? x.id === editing.id : editing.tab === "timeline" ? `${x.year}-${x.title}` === editing.id : (x as { slug?: string }).slug === editing.id,
        );
        if (i >= 0) list[i] = draft;
      }
      return { ...w, [key]: list };
    });
    setEditing(null);
    setDraft(null);
  };

  const removeItem = (t: Tab, id: string) => {
    const key = t as keyof Working;
    setWork((w) => ({
      ...w,
      [key]: asRecs(w[key]).filter((x) =>
        t === "matches" ? x.id !== id : t === "media" ? x.id !== id : t === "timeline" ? `${x.year}-${x.title}` !== id : (x as { slug?: string }).slug !== id,
      ),
    }));
  };

  const publish = async () => {
    if (!token || changed.length === 0) return;
    setBusy(true);
    setLog([`Publishing ${changed.length} file(s) to ${owner}/${repo}@${branch}…`]);
    try {
      sessionStorage.setItem(TOKENKEY, token);
    } catch { /* ignore */ }
    for (const f of changed) {
      const api = `https://api.github.com/repos/${owner}/${repo}/contents/${f.path}`;
      try {
        const cur = await fetch(`${api}?ref=${branch}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
        const sha = cur.ok ? ((await cur.json()).sha as string) : undefined;
        const res = await fetch(api, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
          body: JSON.stringify({ message: `${message} (${f.label})`, content: b64(fileBody(f.key, work)), ...(sha ? { sha } : {}), branch }),
        });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        setLog((l) => [...l, `✓ ${f.path}`]);
      } catch (e) {
        setLog((l) => [...l, `✗ ${f.path}: ${e instanceof Error ? e.message : "failed"}`]);
        setBusy(false);
        return;
      }
    }
    setLog((l) => [...l, "Done — site rebuilds in ~1 min.", `Watch: https://github.com/${owner}/${repo}/actions`]);
    try {
      localStorage.removeItem(DRAFTKEY);
    } catch { /* ignore */ }
    setRestored(false);
    setBusy(false);
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
            <p className="text-xs text-white/40">Manage the site. Publish goes live in ~1 min.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {restored && <span className="border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[11px] font-bold text-amber-200">DRAFT RESTORED</span>}
          <button
            onClick={() => setTab("publish")}
            className={cn(
              "relative px-5 py-2.5 text-[12px] font-bold tracking-[0.16em] uppercase cursor-pointer transition-all",
              changed.length ? "bg-[var(--accent)] text-white" : "border border-white/15 text-white/60",
            )}
          >
            Publish{changed.length > 0 && ` (${changed.length})`}
          </button>
        </div>
      </header>

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
              {t.id !== "publish" && changed.some((f) => f.key === t.id || (["news", "media", "timeline"].includes(t.id) && f.key === "news")) && (
                <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === "publish" ? (
        <section className="mt-8 space-y-5" aria-label="Publish">
          <div className="border border-white/10 bg-[#0C0F16] p-5 md:p-7">
            <h2 className="font-display text-2xl font-bold">PUBLISH CHANGES.</h2>
            <p className="mt-2 text-sm text-white/55">
              Publishing commits the edited JSON files to GitHub. The Pages workflow rebuilds
              and the live site updates in about a minute. Your token stays in this tab only.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="label !text-[10px] text-white/40">Owner</span>
                <input value={owner} onChange={(e) => setOwner(e.target.value)} className="mt-1.5 w-full border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)]" /></label>
              <label className="block"><span className="label !text-[10px] text-white/40">Repo</span>
                <input value={repo} onChange={(e) => setRepo(e.target.value)} className="mt-1.5 w-full border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)]" /></label>
              <label className="block"><span className="label !text-[10px] text-white/40">Branch</span>
                <input value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-1.5 w-full border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)]" /></label>
              <label className="block"><span className="label !text-[10px] text-white/40">GitHub token (classic, repo scope)</span>
                <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_…" className="mt-1.5 w-full border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm placeholder:text-white/25 focus:outline-none focus:border-[var(--accent)]" /></label>
            </div>
            <label className="mt-4 block"><span className="label !text-[10px] text-white/40">Commit message</span>
              <input value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1.5 w-full border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)]" /></label>
            <div className="mt-5">
              <p className="label !text-[10px] text-white/40 mb-2">Changed files ({changed.length})</p>
              {changed.length === 0 ? (
                <p className="text-sm text-white/45">Nothing to publish — everything matches the live site.</p>
              ) : (
                <ul className="space-y-1.5">
                  {changed.map((f) => (
                    <li key={f.path} className="flex items-center gap-2 text-sm text-white/75">
                      <Check className="size-4 text-[var(--accent)]" /> {f.path}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={publish}
              disabled={busy || !token || changed.length === 0}
              className="mt-6 w-full bg-[var(--accent)] py-4 text-sm font-bold tracking-[0.2em] uppercase hover:brightness-110 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy ? "Publishing…" : "Publish to live site →"}
            </button>
            {log.length > 0 && (
              <div className="mt-4 border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap" role="status">
                {log.join("\n")}
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify({ players: work.players, teams: work.teams, matches: work.matches, tournaments: work.tournaments, ...contentPayload(work) }, null, 2)], { type: "application/json" });
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
              <Upload className="size-4" /> Restore backup
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const j = JSON.parse(await f.text()) as Partial<Working> & { news?: NewsArticle[]; media?: MediaItem[]; timeline?: TimelineEvent[] };
                  setWork((w) => ({
                    players: (j.players as Player[]) ?? w.players,
                    teams: (j.teams as Team[]) ?? w.teams,
                    matches: (j.matches as Match[]) ?? w.matches,
                    tournaments: (j.tournaments as Tournament[]) ?? w.tournaments,
                    news: (j.news as NewsArticle[]) ?? w.news,
                    media: (j.media as MediaItem[]) ?? w.media,
                    timeline: (j.timeline as TimelineEvent[]) ?? w.timeline,
                  }));
                  setLog([`Restored backup ${f.name} into the editor. Review, then Publish.`]);
                } catch {
                  setLog(["Could not read that file."]);
                }
                e.target.value = "";
              }}
            />
            <button
              onClick={() => {
                try {
                  localStorage.removeItem(DRAFTKEY);
                } catch { /* ignore */ }
                setWork(seedOf());
                setRestored(false);
              }}
              className="border border-white/15 px-4 py-3 text-xs font-bold tracking-[0.16em] uppercase text-white/70 hover:text-white cursor-pointer"
            >
              Discard drafts
            </button>
          </div>
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
    </div>
  );
}

function rowCls() {
  return "flex items-center justify-between gap-3 border border-white/8 bg-[#0C0F16] p-4 hover:border-[var(--accent)]/40 cursor-pointer transition-colors text-left w-full";
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
    <div key={`${t.year}-${t.title}-${i}`} className="flex items-stretch gap-2">
      <button onClick={() => openEdit("timeline", `${t.year}-${t.title}`)} className={rowCls()}>
        <span><span className="font-display text-xl font-bold">{t.year} — {t.title}</span>
          <span className="block text-xs text-white/45">{t.text}</span></span>
        <span className="text-xs text-white/30">Edit →</span>
      </button>
      <button onClick={() => ask(`Delete timeline entry?`, () => removeItem("timeline", `${t.year}-${t.title}`))} aria-label="Delete entry" className="shrink-0 border border-white/10 px-3.5 text-white/40 hover:text-red-300 hover:border-red-400/50 cursor-pointer">✕</button>
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
