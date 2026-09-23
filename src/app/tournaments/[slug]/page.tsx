import { TOURNAMENTS } from "@/data/tournaments";
import { TournamentDetail } from "@/components/tournament/TournamentDetail";

export function generateStaticParams() {
  return TOURNAMENTS.map((t) => ({ slug: t.slug }));
}

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TournamentDetail slug={slug} />;
}
