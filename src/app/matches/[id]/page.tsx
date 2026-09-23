import { notFound } from "next/navigation";
import Link from "next/link";
import { MATCHES, getMatch } from "@/data/matches";
import { getTeam } from "@/data/teams";
import { getPlayer } from "@/data/players";
import { getTournament } from "@/data/tournaments";
import { PageHero } from "@/components/ui/PageHero";
import { SECTION_BG } from "@/data/imagery";
import { Badge } from "@/components/ui/primitives";
import { Countdown } from "@/components/ui/Countdown";
import { formatDate, formatTime, kda } from "@/lib/utils";

export function generateStaticParams() {
  return MATCHES.map((m) => ({ id: m.id }));
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();
  const team = getTeam(match.teamSlug);
  const tournament = getTournament(match.tournamentSlug);

  return (
    <>
      <PageHero
        index="03"
        label={`${match.tournamentName} — ${match.stage}`}
        title={`${team?.shortName} VS ${match.opponentShort}`}
        sub={`${team?.name} vs ${match.opponent} · ${formatDate(match.date)} · ${formatTime(match.date)}${match.venue ? ` · ${match.venue}` : ""}`}
        image={SECTION_BG.matches}
      />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16">
        {match.status === "upcoming" ? (
          <div className="border border-white/8 bg-[#0C0F16] p-8 md:p-12">
            <Badge tone="accent">Upcoming</Badge>
            {tournament && (
              <p className="mt-3 text-sm text-white/55">
                <Link href={`/tournaments/${tournament.slug}`} className="border-b border-white/20 hover:text-white">
                  {tournament.name}
                </Link>{" "}
                · {match.stage}
              </p>
            )}
            <div className="mt-6">
              <Countdown targetIso={match.date} />
            </div>
          </div>
        ) : (
          <>
            <div className="grain relative overflow-hidden border border-white/8 bg-[#0C0F16] p-8 md:p-14 text-center">
              <p className="label text-white/40">Final score</p>
              <p className="font-display mt-3 text-7xl md:text-9xl font-bold tracking-tight tabular-nums">
                {match.scoreUs} <span className="text-white/25">—</span> {match.scoreThem}
              </p>
              <div className="mt-4 flex justify-center">
                <Badge tone={match.result === "WIN" ? "win" : match.result === "LOSS" ? "loss" : "draw"}>
                  {match.result === "WIN" ? "Victory" : match.result}
                </Badge>
              </div>
            </div>

            {match.games && (
              <section className="mt-12" aria-label="Games">
                <h2 className="font-display text-3xl font-bold tracking-tight">GAME BY GAME.</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {match.games.map((g) => (
                    <div key={g.game} className="border border-white/8 bg-[#0C0F16] p-6">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-xl font-bold">GAME {g.game}</p>
                        <Badge tone={g.result === "WIN" ? "win" : g.result === "LOSS" ? "loss" : "draw"}>{g.result}</Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm tabular-nums">
                        <div><p className="label !text-[10px] text-white/35">Duration</p><p className="mt-1 font-bold">{g.duration ?? "—"}</p></div>
                        <div><p className="label !text-[10px] text-white/35">Kills</p><p className="mt-1 font-bold">{g.killsUs ?? "—"} — {g.killsThem ?? "—"}</p></div>
                        <div><p className="label !text-[10px] text-white/35">Towers</p><p className="mt-1 font-bold">{g.towersUs ?? "—"} — {g.towersThem ?? "—"}</p></div>
                      </div>
                      {g.mvp && getPlayer(g.mvp) && (
                        <p className="mt-3 text-xs tracking-[0.14em] uppercase text-white/50">
                          MVP — <Link href={`/players/${g.mvp}`} className="text-[var(--accent)] hover:text-white">{getPlayer(g.mvp)?.gamertag}</Link>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {match.statLines && (
              <section className="mt-12" aria-label="Player performance">
                <h2 className="font-display text-3xl font-bold tracking-tight">PERFORMANCE.</h2>
                <div className="mt-6 overflow-x-auto border border-white/8">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-left text-[11px] tracking-[0.18em] uppercase text-white/40">
                        <th className="px-5 py-3">Player</th>
                        <th className="px-5 py-3">K / D / A</th>
                        <th className="px-5 py-3">KDA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {match.statLines.map((s) => {
                        const p = getPlayer(s.playerSlug);
                        return (
                          <tr key={s.playerSlug} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="px-5 py-3 font-bold">
                              {p ? <Link href={`/players/${p.slug}`} className="hover:text-[var(--accent)]">{p.gamertag}</Link> : s.playerSlug}
                            </td>
                            <td className="px-5 py-3 tabular-nums">{s.kills} / {s.deaths} / {s.assists}</td>
                            <td className="px-5 py-3 tabular-nums font-bold">{kda(s.kills, s.deaths, s.assists)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
