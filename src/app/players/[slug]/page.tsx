import { PLAYERS } from "@/data/players";
import { fetchLiveContent } from "@/lib/supabase";
import { PlayerView } from "@/components/player/PlayerView";

export async function generateStaticParams() {
  try {
    const live = await fetchLiveContent();
    const list = live?.players?.length ? live.players : PLAYERS;
    const slugs = new Set([...PLAYERS.map((p) => p.slug), ...list.map((p) => p.slug)]);
    return Array.from(slugs).map((slug) => ({ slug }));
  } catch {
    return PLAYERS.map((p) => ({ slug: p.slug }));
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlayerView slug={slug} />;
}
