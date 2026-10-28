import { NEWS } from "@/data/content";
import { fetchLiveContent } from "@/lib/supabase";
import { ArticleView } from "@/components/news/ArticleView";

export async function generateStaticParams() {
  try {
    const live = await fetchLiveContent();
    const list = live?.news?.length ? live.news : NEWS;
    const slugs = new Set([...NEWS.map((n) => n.slug), ...list.map((n) => n.slug)]);
    return Array.from(slugs).map((slug) => ({ slug }));
  } catch {
    return NEWS.map((n) => ({ slug: n.slug }));
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
}
