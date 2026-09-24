 "use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Match, Player, Team, Tournament, NewsArticle } from "@/data/types";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";
import { RoleBadge } from "@/components/ui/RoleIcon";
import { Artwork } from "@/components/ui/Artwork";
import { TeamLogo } from "@/components/ui/TeamLogos";
import { TEAM_CARD_ART, NEWS_ART } from "@/data/imagery";
import { SlidingName } from "@/components/ui/SlidingName";
import { getTeam } from "@/data/teams";
import { ArrowUpRight } from "lucide-react";

export function PlayerCard({ player, index = 0 }: { player: Player; index?: number }) {
  const team = getTeam(player.teamSlug);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 5) * 0.06 }}
    >
      <Link
        href={`/players/${player.slug}`}
        className="group relative block overflow-hidden border border-white/8 bg-[#0C0F16] hover:border-[var(--accent)]/50 transition-colors duration-300"
        aria-label={`${player.gamertag}, ${player.role} for ${team?.name}`}
      >
        <Artwork hue={player.hue} label={player.gamertag.slice(0, 2)} className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-14">
          <RoleBadge role={player.role} />
          <SlidingName text={player.gamertag} className="font-display mt-2 text-3xl font-bold tracking-tight" />
          <p className="mt-1 text-xs tracking-[0.14em] uppercase text-white/50">
            {team?.shortName} — Signature: {player.favoriteHero}
          </p>
        </div>
        <span className="font-display absolute top-3 right-4 text-5xl font-bold text-white/15">
          {String(player.number).padStart(2, "0")}
        </span>
      </Link>
    </motion.div>
  );
}

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      href={`/teams/${team.slug}`}
      className="group relative block overflow-hidden border border-white/8 bg-[#0C0F16] hover:border-[var(--accent)]/50 transition-all duration-500"
    >
      <div className="relative overflow-hidden">
        {TEAM_CARD_ART[team.slug] ? (
          <img
            src={TEAM_CARD_ART[team.slug]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="block aspect-[16/10] w-full object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <Artwork hue={team.hue} label={team.index} className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-[1.05]" />
        )}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.15) 0%, rgba(7,9,13,0.55) 100%)" }}
        />
        <TeamLogo slug={team.slug} className="absolute bottom-4 right-5 h-12 w-auto text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
      </div>
      <div className="p-6 md:p-8">
        <p className="label text-[var(--accent)]">
          {team.index} — {team.tier} · {team.verb}
        </p>
        <h3 className="font-display mt-2 text-3xl md:text-4xl font-bold tracking-tight group-hover:translate-x-1 transition-transform duration-300">
          {team.name}
        </h3>
        <p className="mt-2 text-sm text-white/55">{team.tagline}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] uppercase text-white/70 group-hover:text-white">
          Explore squad <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const team = getTeam(match.teamSlug);
  const tone = match.result === "WIN" ? "win" : match.result === "LOSS" ? "loss" : match.result === "DRAW" ? "draw" : "default";
  return (
    <Link
      href={`/matches/${match.id}`}
      className="group flex items-center justify-between gap-4 border-b border-white/8 py-5 hover:bg-white/[0.02] px-2 md:px-4 transition-colors"
    >
      <div className="min-w-0">
        <p className="label text-white/35">
          {match.tournamentName} · {match.stage}
        </p>
        <p className="font-display mt-1 truncate text-lg md:text-2xl font-bold tracking-tight">
          {team?.shortName} <span className="text-white/30">{match.scoreUs ?? "–"} — {match.scoreThem ?? "–"}</span> {match.opponentShort}
        </p>
        <p className="mt-1 text-xs text-white/40">
          {formatDate(match.date)} · {formatTime(match.date)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {match.result ? <Badge tone={tone}>{match.result}</Badge> : <Badge tone="accent">Upcoming</Badge>}
        <ArrowUpRight className="size-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </Link>
  );
}

export function TournamentCard({ t, index = 0 }: { t: Tournament; index?: number }) {
  return (
    <Link
      href={`/tournaments/${t.slug}`}
      className="group relative block overflow-hidden border border-white/8 bg-[#0C0F16] hover:border-[var(--accent)]/50 transition-colors"
      aria-label={t.name}
    >
      <Artwork hue={t.hue} label={t.name.slice(0, 2)} className={cn("w-full transition-transform duration-700 group-hover:scale-[1.04]", index === 0 ? "aspect-[16/8]" : "aspect-[16/9]")} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{t.status}</Badge>
          <Badge>{t.stage}</Badge>
          {t.prizePool && <Badge>{t.prizePool}</Badge>}
        </div>
        <h3 className="font-display mt-3 text-3xl md:text-4xl font-bold tracking-tight">{t.name}</h3>
        <p className="mt-1 text-sm text-white/60">
          {formatDate(t.date)} {t.venue ? `· ${t.venue}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function NewsCard({ a }: { a: NewsArticle }) {
  const art = NEWS_ART[a.slug];
  return (
    <Link href={`/news/${a.slug}`} className="group block border border-white/8 bg-[#0C0F16] hover:border-[var(--accent)]/50 transition-colors overflow-hidden">
      <div className="relative overflow-hidden">
        {art ? (
          <img
            src={art}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="block aspect-[16/8] w-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <Artwork hue={a.hue} label={a.category.slice(0, 2)} className="aspect-[16/8] w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.1) 0%, rgba(7,9,13,0.5) 100%)" }}
        />
      </div>
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-3">
          <Badge tone="accent">{a.category}</Badge>
          <span className="text-xs text-white/40">{formatDate(a.date)} · {a.readMinutes} min</span>
        </div>
        <h3 className="font-display mt-3 text-xl md:text-2xl font-bold leading-tight tracking-tight group-hover:text-white">{a.title}</h3>
        <p className="mt-2 text-sm text-white/55 line-clamp-2">{a.excerpt}</p>
      </div>
    </Link>
  );
}
