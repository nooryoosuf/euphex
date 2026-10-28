import { MATCHES } from "@/data/matches";
import { fetchLiveContent } from "@/lib/supabase";
import { MatchView } from "@/components/match/MatchView";

export async function generateStaticParams() {
  try {
    const live = await fetchLiveContent();
    const list = live?.matches?.length ? live.matches : MATCHES;
    const ids = new Set([...MATCHES.map((m) => m.id), ...list.map((m) => m.id)]);
    return Array.from(ids).map((id) => ({ id }));
  } catch {
    return MATCHES.map((m) => ({ id: m.id }));
  }
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchView id={id} />;
}
