import { MATCHES } from "@/data/matches";
import { MatchView } from "@/components/match/MatchView";

export function generateStaticParams() {
  return MATCHES.map((m) => ({ id: m.id }));
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchView id={id} />;
}
