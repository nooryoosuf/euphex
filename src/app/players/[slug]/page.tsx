import { notFound } from "next/navigation";
import Link from "next/link";
import { PLAYERS, getPlayer, getTeamPlayers } from "@/data/players";
import { getTeam } from "@/data/teams";
import { Artwork } from "@/components/ui/Artwork";
import { Badge, Stat } from "@/components/ui/primitives";
import { RoleBadge } from "@/components/ui/RoleIcon";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { PlayerCard } from "@/components/ui/cards";
import { HeroPoolBlock } from "@/components/player/HeroPool";
import { imageForPlayer } from "@/data/imagery";

export function generateStaticParams() {
  return PLAYERS.map((p) => ({ slug: p.slug }));
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = getPlayer(slug);
  if (!player) notFound();
  const team = getTeam(player.teamSlug);
  const teammates = getTeamPlayers(player.teamSlug).filter((p) => p.slug !== player.slug);

  return (
    <>
      <div className="grain relative overflow-hidden border-b border-white/8">
        <img
          src={imageForPlayer(player.favoriteHero, player.role)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[center_15%]"
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background: `linear-gradient(180deg, rgba(7,9,13,0.68) 0%, rgba(7,9,13,0.55) 45%, rgba(7,9,13,0.94) 85%, #07090D 100%), radial-gradient(70% 90% at 80% 10%, hsl(${player.hue} 80% 55% / 0.25), transparent 60%)`,
          }}
        />
        <div className="relative mx-auto grid max-w-[1400px] gap-8 px-5 md:px-10 pt-32 md:pt-44 pb-12 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <p className="label text-white/40">
              <Link href="/players" className="hover:text-white">
                Players
              </Link>{" "}
              / {team?.shortName}
            </p>
            <RoleBadge role={player.role} className="mt-5" />
            <h1 className="font-display mt-2 text-6xl md:text-9xl font-bold leading-[0.9] tracking-tight">{player.gamertag}</h1>
            <p className="mt-3 text-lg text-white/60">
              {player.realName} — {player.country}
            </p>
            <blockquote className="font-display mt-6 border-l-2 border-[var(--accent)] pl-5 text-2xl md:text-3xl font-medium italic text-white/85">
              “{player.quote}”
            </blockquote>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4 text-sm">
              {[
                ["COUNTRY", player.country],
                ["PRIMARY", player.role],
                ["JOINED", player.joined],
                ["TEAM", team?.shortName ?? "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="label !text-[10px] text-white/35">{k}</p>
                  <p className="mt-1 font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <Artwork hue={player.hue} label={player.gamertag.slice(0, 2)} className="aspect-[3/4] w-full max-w-[380px] justify-self-end hidden sm:block" />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-3 gap-6 border-y border-white/8 py-8">
          <Stat value={<CountUp to={player.matches} />} label="Matches" />
          <Stat value={<CountUp to={player.winRate} suffix="%" />} label="Win rate" />
          <Stat value={<CountUp to={player.mvps} />} label="MVPs" />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["PLAYSTYLE", player.playstyle],
            ["FAVORITE HERO", player.favoriteHero],
            ["SIGNATURE", player.signatureMove],
          ].map(([k, v]) => (
            <div key={k} className="border border-white/8 bg-[#0C0F16] p-6">
              <p className="label text-[var(--accent)]">{k}</p>
              <p className="font-display mt-2 text-2xl font-bold">{v}</p>
            </div>
          ))}
        </div>

        <section className="mt-16 md:mt-24" aria-label="Hero pool">
          <p className="label text-white/40">Cinematic pool</p>
          <h2 className="font-display mt-2 mb-8 text-4xl md:text-6xl font-bold tracking-tight">HERO POOL.</h2>
          <HeroPoolBlock player={player} />
        </section>

        {player.achievements.length > 0 && (
          <section className="mt-16 md:mt-24" aria-label="Achievements">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">ACHIEVEMENTS.</h2>
            <ol className="mt-8 border-t border-white/8">
              {player.achievements.map((a, i) => (
                <Reveal key={i}>
                  <li className="flex flex-wrap items-center gap-4 border-b border-white/8 py-5">
                    <span className="font-display text-4xl font-bold text-white/15">{a.year}</span>
                    <Badge tone={a.kind === "Champion" || a.kind === "MVP" ? "accent" : "default"}>{a.kind}</Badge>
                    <span className="font-display text-xl font-bold">{a.event}</span>
                    <span className="text-sm text-white/50">— {a.title}</span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </section>
        )}

        <section className="mt-16 md:mt-24" aria-label="Teammates">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">SQUAD MATES.</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {teammates.map((p, i) => (
              <PlayerCard key={p.slug} player={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
