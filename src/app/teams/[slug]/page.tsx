import { TEAMS } from "@/data/teams";
import { TeamView } from "@/components/team/TeamView";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ slug: t.slug }));
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TeamView slug={slug} />;
}
