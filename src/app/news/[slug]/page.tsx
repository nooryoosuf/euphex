import { NEWS } from "@/data/content";
import { ArticleView } from "@/components/news/ArticleView";

export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
}
