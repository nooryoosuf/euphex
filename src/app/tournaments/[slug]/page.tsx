import { TOURNAMENTS } from "@/data/tournaments";
import { fetchLiveContent } from "@/lib/supabase";
import { TournamentDetail } from "@/components/tournament/TournamentDetail";

export async function generateStaticParams() {
  try {
    const live = await fetchLiveContent();
    const list = live?.tournaments?.length ? live.tournaments : TOURNAMENTS;
    const slugs = new Set([...TOURNAMENTS.map((t) => t.slug), ...list.map((t) => t.slug)]);
    return Array.from(slugs).map((slug) => ({ slug }));
  } catch {
    return TOURNAMENTS.map((t) => ({ slug: t.slug }));
  }
}

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TournamentDetail slug={slug} />;
}
