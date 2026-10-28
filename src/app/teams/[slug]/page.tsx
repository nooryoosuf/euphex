import { TEAMS } from "@/data/teams";
import { fetchLiveContent } from "@/lib/supabase";
import { TeamView } from "@/components/team/TeamView";

export async function generateStaticParams() {
  try {
    const live = await fetchLiveContent();
    const list = live?.teams?.length ? live.teams : TEAMS;
    const slugs = new Set([...TEAMS.map((t) => t.slug), ...list.map((t) => t.slug)]);
    return Array.from(slugs).map((slug) => ({ slug }));
  } catch {
    return TEAMS.map((t) => ({ slug: t.slug }));
  }
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TeamView slug={slug} />;
}
