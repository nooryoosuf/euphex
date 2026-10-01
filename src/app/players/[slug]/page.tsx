import { PLAYERS } from "@/data/players";
import { PlayerView } from "@/components/player/PlayerView";

export function generateStaticParams() {
  return PLAYERS.map((p) => ({ slug: p.slug }));
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlayerView slug={slug} />;
}
