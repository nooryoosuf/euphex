"use client";
import type {
  Achievement, GameDetail, LaneRole, Match, MediaItem, NewsArticle,
  Player, PlayerStatLine, Team, TimelineEvent, Tournament,
} from "@/data/types";
import { F, T, N, Sel, TA, ListEditor } from "./ui";

const ROLES: LaneRole[] = ["EXP Lane", "Gold Lane", "Mid Lane", "Jungle", "Roam"];
const CATS = ["signature", "comfort", "pocket"];
const KINDS = ["Champion", "Runner Up", "MVP", "Top 4", "Award"];
const RESULTS = ["WIN", "LOSS", "DRAW"];
const STATUSES = ["upcoming", "live", "completed"];
const TSTATES = ["UPCOMING", "ONGOING", "COMPLETED"];
const TIERS = ["MAIN", "SECOND", "ACADEMY", "DEVELOPMENT"];
const NCATS = ["TEAM", "TOURNAMENT", "COMMUNITY", "MATCHDAY"];
const MCATS = ["MATCHDAY", "TEAM", "COMMUNITY", "BEHIND THE SCENES"];

type Patch<T> = (p: Partial<T>) => void;

/* ── players ── */

export function PlayerEditor({ value: v, onChange: c, teamSlugs }: { value: Player; onChange: Patch<Player>; teamSlugs: string[] }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Slug (URL)"><T value={v.slug} onChange={(e) => c({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
        <F label="Gamertag"><T value={v.gamertag} onChange={(e) => c({ gamertag: e.target.value })} /></F>
        <F label="Real name"><T value={v.realName} onChange={(e) => c({ realName: e.target.value })} /></F>
        <F label="Team"><Sel value={v.teamSlug} onChange={(e) => c({ teamSlug: e.target.value })}>{teamSlugs.map((t) => <option key={t}>{t}</option>)}</Sel></F>
        <F label="Primary role"><Sel value={v.role} onChange={(e) => c({ role: e.target.value as LaneRole })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Sel></F>
        <F label="Secondary role (optional)">
          <Sel value={v.secondaryRole ?? ""} onChange={(e) => c({ secondaryRole: (e.target.value || undefined) as LaneRole | undefined })}>
            <option value="">— none —</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </Sel>
        </F>
        <F label="Country"><T value={v.country} onChange={(e) => c({ country: e.target.value })} /></F>
        <F label="Country code"><T value={v.countryCode} onChange={(e) => c({ countryCode: e.target.value.toUpperCase() })} /></F>
        <F label="Joined"><T value={v.joined} onChange={(e) => c({ joined: e.target.value })} /></F>
        <F label="Jersey number"><N value={v.number} onChange={(e) => c({ number: Number(e.target.value) })} /></F>
        <F label="Matches"><N value={v.matches} onChange={(e) => c({ matches: Number(e.target.value) })} /></F>
        <F label="Win rate %"><N value={v.winRate} onChange={(e) => c({ winRate: Number(e.target.value) })} /></F>
        <F label="MVPs"><N value={v.mvps} onChange={(e) => c({ mvps: Number(e.target.value) })} /></F>
        <F label="Card hue (0–360)"><N value={v.hue} onChange={(e) => c({ hue: Number(e.target.value) })} /></F>
      </div>
      <F label="Quote"><T value={v.quote} onChange={(e) => c({ quote: e.target.value })} /></F>
      <div className="grid gap-4 sm:grid-cols-3">
        <F label="Playstyle"><T value={v.playstyle} onChange={(e) => c({ playstyle: e.target.value })} /></F>
        <F label="Signature move"><T value={v.signatureMove} onChange={(e) => c({ signatureMove: e.target.value })} /></F>
        <F label="Favorite hero"><T value={v.favoriteHero} onChange={(e) => c({ favoriteHero: e.target.value })} /></F>
      </div>
      <div>
        <p className="label !text-[10px] text-white/40 mb-2">Hero pool</p>
        <ListEditor
          items={v.heroPool}
          onChange={(heroPool) => c({ heroPool })}
          onAdd={() => ({ name: "Fanny", slug: "fanny", lane: "Jungle" as LaneRole, art: { hue: 220, label: "FA" }, games: 0, winRate: 50, category: "comfort" as const })}
          addLabel="Add hero"
          render={(h, u) => (
            <div className="grid grid-cols-2 gap-3">
              <F label="Hero"><T value={h.name} onChange={(e) => u({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })} /></F>
              <F label="Category"><Sel value={h.category} onChange={(e) => u({ category: e.target.value as "signature" | "comfort" | "pocket" })}>{CATS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
              <F label="Lane"><Sel value={h.lane} onChange={(e) => u({ lane: e.target.value as LaneRole & "Multi" })}>{[...ROLES, "Multi"].map((x) => <option key={x}>{x}</option>)}</Sel></F>
              <F label="Games"><N value={h.games} onChange={(e) => u({ games: Number(e.target.value) })} /></F>
              <F label="Win %"><N value={h.winRate} onChange={(e) => u({ winRate: Number(e.target.value) })} /></F>
              <F label="KDA (opt)"><N value={h.kda ?? ""} placeholder="—" onChange={(e) => u({ kda: e.target.value === "" ? undefined : Number(e.target.value) })} /></F>
              <F label="Power (opt)"><N value={h.power ?? ""} placeholder="—" onChange={(e) => u({ power: e.target.value === "" ? undefined : Number(e.target.value) })} /></F>
              <F label="Card hue"><N value={h.art.hue} onChange={(e) => u({ art: { ...h.art, hue: Number(e.target.value) } })} /></F>
            </div>
          )}
        />
      </div>
      <div>
        <p className="label !text-[10px] text-white/40 mb-2">Achievements</p>
        <ListEditor<Achievement>
          items={v.achievements}
          onChange={(achievements) => c({ achievements })}
          onAdd={() => ({ title: "Champion", event: "", year: 2026, kind: "Champion" })}
          addLabel="Add achievement"
          render={(a, u) => (
            <div className="grid grid-cols-2 gap-3">
              <F label="Title"><T value={a.title} onChange={(e) => u({ title: e.target.value })} /></F>
              <F label="Event"><T value={a.event} onChange={(e) => u({ event: e.target.value })} /></F>
              <F label="Year"><N value={a.year} onChange={(e) => u({ year: Number(e.target.value) })} /></F>
              <F label="Kind"><Sel value={a.kind} onChange={(e) => u({ kind: e.target.value as Achievement["kind"] })}>{KINDS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
            </div>
          )}
        />
      </div>
    </div>
  );
}

/* ── teams ── */

export function TeamEditor({ value: v, onChange: c }: { value: Team; onChange: Patch<Team> }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Slug (URL)"><T value={v.slug} onChange={(e) => c({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
        <F label="Name"><T value={v.name} onChange={(e) => c({ name: e.target.value })} /></F>
        <F label="Short code"><T value={v.shortName} onChange={(e) => c({ shortName: e.target.value })} /></F>
        <F label="Tier"><Sel value={v.tier} onChange={(e) => c({ tier: e.target.value as Team["tier"] })}>{TIERS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
        <F label="Index (01)"><T value={v.index} onChange={(e) => c({ index: e.target.value })} /></F>
        <F label="Verb"><T value={v.verb} onChange={(e) => c({ verb: e.target.value })} /></F>
        <F label="Wins"><N value={v.wins} onChange={(e) => c({ wins: Number(e.target.value) })} /></F>
        <F label="Losses"><N value={v.losses} onChange={(e) => c({ losses: Number(e.target.value) })} /></F>
        <F label="Titles"><N value={v.championships} onChange={(e) => c({ championships: Number(e.target.value) })} /></F>
        <F label="Founded"><N value={v.founded} onChange={(e) => c({ founded: Number(e.target.value) })} /></F>
        <F label="Card hue"><N value={v.hue} onChange={(e) => c({ hue: Number(e.target.value) })} /></F>
      </div>
      <F label="Tagline"><T value={v.tagline} onChange={(e) => c({ tagline: e.target.value })} /></F>
      <F label="Description"><TA value={v.description} onChange={(e) => c({ description: e.target.value })} /></F>
      <F label="Playstyle words (comma separated)" hint="e.g. HUNGRY., MECHANICAL., FEARLESS.">
        <T value={v.playstyle.join(", ")} onChange={(e) => c({ playstyle: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
      </F>
      <div>
        <p className="label !text-[10px] text-white/40 mb-2">Achievements</p>
        <ListEditor<Achievement>
          items={v.achievements}
          onChange={(achievements) => c({ achievements })}
          onAdd={() => ({ title: "Champion", event: "", year: 2026, kind: "Champion" })}
          addLabel="Add achievement"
          render={(a, u) => (
            <div className="grid grid-cols-2 gap-3">
              <F label="Title"><T value={a.title} onChange={(e) => u({ title: e.target.value })} /></F>
              <F label="Event"><T value={a.event} onChange={(e) => u({ event: e.target.value })} /></F>
              <F label="Year"><N value={a.year} onChange={(e) => u({ year: Number(e.target.value) })} /></F>
              <F label="Kind"><Sel value={a.kind} onChange={(e) => u({ kind: e.target.value as Achievement["kind"] })}>{KINDS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
            </div>
          )}
        />
      </div>
    </div>
  );
}

/* ── matches ── */

export function MatchEditor({ value: v, onChange: c, teamSlugs }: { value: Match; onChange: Patch<Match>; teamSlugs: string[] }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Match ID (URL)"><T value={v.id} onChange={(e) => c({ id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
        <F label="Status"><Sel value={v.status} onChange={(e) => c({ status: e.target.value as Match["status"] })}>{STATUSES.map((x) => <option key={x}>{x}</option>)}</Sel></F>
        <F label="Our squad"><Sel value={v.teamSlug} onChange={(e) => c({ teamSlug: e.target.value })}>{teamSlugs.map((t) => <option key={t}>{t}</option>)}</Sel></F>
        <F label="Opponent"><T value={v.opponent} onChange={(e) => c({ opponent: e.target.value })} /></F>
        <F label="Opponent code"><T value={v.opponentShort} onChange={(e) => c({ opponentShort: e.target.value })} /></F>
        <F label="Tournament name"><T value={v.tournamentName} onChange={(e) => c({ tournamentName: e.target.value })} /></F>
        <F label="Tournament slug"><T value={v.tournamentSlug} onChange={(e) => c({ tournamentSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
        <F label="Stage"><T value={v.stage} onChange={(e) => c({ stage: e.target.value })} /></F>
        <F label="Date & time">
          <input type="datetime-local" value={v.date.slice(0, 16)} onChange={(e) => c({ date: e.target.value ? `${e.target.value}:00` : v.date })}
            className="w-full border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--accent)] [color-scheme:dark]" />
        </F>
        <F label="Venue (opt)"><T value={v.venue ?? ""} placeholder="—" onChange={(e) => c({ venue: e.target.value || undefined })} /></F>
        <F label="Our score"><N value={v.scoreUs ?? ""} placeholder="—" onChange={(e) => c({ scoreUs: e.target.value === "" ? undefined : Number(e.target.value) })} /></F>
        <F label="Their score"><N value={v.scoreThem ?? ""} placeholder="—" onChange={(e) => c({ scoreThem: e.target.value === "" ? undefined : Number(e.target.value) })} /></F>
        <F label="Result">
          <Sel value={v.result ?? ""} onChange={(e) => c({ result: (e.target.value || undefined) as Match["result"] })}>
            <option value="">— none yet —</option>
            {RESULTS.map((x) => <option key={x}>{x}</option>)}
          </Sel>
        </F>
      </div>
      <div>
        <p className="label !text-[10px] text-white/40 mb-2">Games (game-by-game)</p>
        <ListEditor<GameDetail>
          items={v.games ?? []}
          onChange={(games) => c({ games: games.length ? games : undefined })}
          onAdd={() => ({ game: (v.games?.length ?? 0) + 1, result: "WIN" as const })}
          addLabel="Add game"
          render={(g, u) => (
            <div className="grid grid-cols-3 gap-3">
              <F label="Game #"><N value={g.game} onChange={(e) => u({ game: Number(e.target.value) })} /></F>
              <F label="Result"><Sel value={g.result} onChange={(e) => u({ result: e.target.value as GameDetail["result"] })}>{RESULTS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
              <F label="Duration"><T value={g.duration ?? ""} placeholder="18:42" onChange={(e) => u({ duration: e.target.value || undefined })} /></F>
              <F label="Kills us"><N value={g.killsUs ?? ""} placeholder="—" onChange={(e) => u({ killsUs: e.target.value === "" ? undefined : Number(e.target.value) })} /></F>
              <F label="Kills them"><N value={g.killsThem ?? ""} placeholder="—" onChange={(e) => u({ killsThem: e.target.value === "" ? undefined : Number(e.target.value) })} /></F>
              <F label="MVP slug"><T value={g.mvp ?? ""} placeholder="—" onChange={(e) => u({ mvp: e.target.value || undefined })} /></F>
            </div>
          )}
        />
      </div>
      <div>
        <p className="label !text-[10px] text-white/40 mb-2">Player stat lines (K/D/A)</p>
        <ListEditor<PlayerStatLine>
          items={v.statLines ?? []}
          onChange={(statLines) => c({ statLines: statLines.length ? statLines : undefined })}
          onAdd={() => ({ playerSlug: "", kills: 0, deaths: 0, assists: 0 })}
          addLabel="Add stat line"
          render={(s, u) => (
            <div className="grid grid-cols-2 gap-3">
              <F label="Player slug"><T value={s.playerSlug} onChange={(e) => u({ playerSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
              <F label="K"><N value={s.kills} onChange={(e) => u({ kills: Number(e.target.value) })} /></F>
              <F label="D"><N value={s.deaths} onChange={(e) => u({ deaths: Number(e.target.value) })} /></F>
              <F label="A"><N value={s.assists} onChange={(e) => u({ assists: Number(e.target.value) })} /></F>
            </div>
          )}
        />
      </div>
    </div>
  );
}

/* ── tournaments ── */

export function TournamentEditor({ value: v, onChange: c }: { value: Tournament; onChange: Patch<Tournament> }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Slug (URL)"><T value={v.slug} onChange={(e) => c({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
        <F label="Name"><T value={v.name} onChange={(e) => c({ name: e.target.value })} /></F>
        <F label="Stage"><T value={v.stage} onChange={(e) => c({ stage: e.target.value })} /></F>
        <F label="Status"><Sel value={v.status} onChange={(e) => c({ status: e.target.value as Tournament["status"] })}>{TSTATES.map((x) => <option key={x}>{x}</option>)}</Sel></F>
        <F label="Start date"><T type="date" value={v.date} onChange={(e) => c({ date: e.target.value })} /></F>
        <F label="End date"><T type="date" value={v.endDate ?? ""} onChange={(e) => c({ endDate: e.target.value || undefined })} /></F>
        <F label="Prize pool"><T value={v.prizePool ?? ""} placeholder="—" onChange={(e) => c({ prizePool: e.target.value || undefined })} /></F>
        <F label="Venue"><T value={v.venue ?? ""} placeholder="—" onChange={(e) => c({ venue: e.target.value || undefined })} /></F>
        <F label="Placement"><T value={v.placement ?? ""} placeholder="—" onChange={(e) => c({ placement: e.target.value || undefined })} /></F>
        <F label="MVP"><T value={v.mvp ?? ""} placeholder="—" onChange={(e) => c({ mvp: e.target.value || undefined })} /></F>
        <F label="Card hue"><N value={v.hue} onChange={(e) => c({ hue: Number(e.target.value) })} /></F>
      </div>
      <F label="Format"><T value={v.format ?? ""} placeholder="—" onChange={(e) => c({ format: e.target.value || undefined })} /></F>
      <F label="Squad slugs (comma separated)" hint="e.g. euphex, aurex">
        <T value={v.teamSlugs.join(", ")} onChange={(e) => c({ teamSlugs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
      </F>
      <F label="Description"><TA value={v.description} onChange={(e) => c({ description: e.target.value })} /></F>
      <div>
        <p className="label !text-[10px] text-white/40 mb-2">Journey steps</p>
        <ListEditor<{ title: string; text: string }>
          items={v.journey ?? []}
          onChange={(journey) => c({ journey: journey.length ? journey : undefined })}
          onAdd={() => ({ title: "", text: "" })}
          addLabel="Add step"
          render={(j, u) => (
            <div className="grid gap-3">
              <F label="Title"><T value={j.title} onChange={(e) => u({ title: e.target.value })} /></F>
              <F label="Text"><TA value={j.text} onChange={(e) => u({ text: e.target.value })} /></F>
            </div>
          )}
        />
      </div>
      <div>
        <p className="label !text-[10px] text-white/40 mb-2">Standings</p>
        <ListEditor<{ team: string; w: number; l: number }>
          items={v.standings ?? []}
          onChange={(standings) => c({ standings: standings.length ? standings : undefined })}
          onAdd={() => ({ team: "", w: 0, l: 0 })}
          addLabel="Add row"
          render={(s, u) => (
            <div className="grid grid-cols-3 gap-3">
              <F label="Team"><T value={s.team} onChange={(e) => u({ team: e.target.value })} /></F>
              <F label="W"><N value={s.w} onChange={(e) => u({ w: Number(e.target.value) })} /></F>
              <F label="L"><N value={s.l} onChange={(e) => u({ l: Number(e.target.value) })} /></F>
            </div>
          )}
        />
      </div>
    </div>
  );
}

/* ── news / media / timeline ── */

export function NewsEditor({ value: v, onChange: c }: { value: NewsArticle; onChange: Patch<NewsArticle> }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Slug (URL)"><T value={v.slug} onChange={(e) => c({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
        <F label="Category"><Sel value={v.category} onChange={(e) => c({ category: e.target.value as NewsArticle["category"] })}>{NCATS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
        <F label="Date"><T type="date" value={v.date} onChange={(e) => c({ date: e.target.value })} /></F>
        <F label="Read minutes"><N value={v.readMinutes} onChange={(e) => c({ readMinutes: Number(e.target.value) })} /></F>
        <F label="Card hue"><N value={v.hue} onChange={(e) => c({ hue: Number(e.target.value) })} /></F>
      </div>
      <F label="Title"><T value={v.title} onChange={(e) => c({ title: e.target.value })} /></F>
      <F label="Excerpt"><TA value={v.excerpt} onChange={(e) => c({ excerpt: e.target.value })} /></F>
      <F label="Body (blank line = new paragraph)"><TA rows={8} value={v.body.join("\n\n")} onChange={(e) => c({ body: e.target.value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) })} /></F>
    </div>
  );
}

export function MediaEditor({ value: v, onChange: c }: { value: MediaItem; onChange: Patch<MediaItem> }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="ID"><T value={v.id} onChange={(e) => c({ id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></F>
        <F label="Category"><Sel value={v.category} onChange={(e) => c({ category: e.target.value as MediaItem["category"] })}>{MCATS.map((x) => <option key={x}>{x}</option>)}</Sel></F>
        <F label="Title"><T value={v.title} onChange={(e) => c({ title: e.target.value })} /></F>
        <F label="Card hue"><N value={v.hue} onChange={(e) => c({ hue: Number(e.target.value) })} /></F>
      </div>
      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input type="checkbox" checked={!!v.tall} onChange={(e) => c({ tall: e.target.checked || undefined })} className="size-4 accent-[#E3256B]" />
        Tall tile (masonry)
      </label>
    </div>
  );
}

export function TimelineEditor({ value: v, onChange: c }: { value: TimelineEvent; onChange: Patch<TimelineEvent> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <F label="Year"><T value={v.year} onChange={(e) => c({ year: e.target.value })} /></F>
      <F label="Title"><T value={v.title} onChange={(e) => c({ title: e.target.value })} /></F>
      <F label="Text"><T value={v.text} onChange={(e) => c({ text: e.target.value })} /></F>
    </div>
  );
}
