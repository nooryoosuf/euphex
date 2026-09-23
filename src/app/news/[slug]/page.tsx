import { notFound } from "next/navigation";
import Link from "next/link";
import { NEWS, getArticle } from "@/data/content";
import { imageForSlug } from "@/data/imagery";
import { Badge } from "@/components/ui/primitives";
import { NewsCard } from "@/components/ui/cards";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const related = NEWS.filter((n) => n.slug !== slug).slice(0, 2);
  return (
    <>
      <div className="grain relative overflow-hidden border-b border-white/8">
        <img
          src={imageForSlug(a.slug)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.62) 0%, rgba(7,9,13,0.45) 40%, #07090D 96%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[900px] px-5 pt-36 md:pt-52 pb-10">
          <div className="flex items-center gap-3">
            <Badge tone="accent">{a.category}</Badge>
            <span className="text-xs text-white/50">{formatDate(a.date)} · {a.readMinutes} min read</span>
          </div>
          <h1 className="font-display mt-4 text-4xl md:text-6xl font-bold leading-[1.0] tracking-tight">{a.title}</h1>
          <p className="mt-4 text-lg text-white/65">{a.excerpt}</p>
        </div>
      </div>
      <article className="mx-auto max-w-[720px] px-5 py-12 md:py-16">
        {a.body.map((p, i) => (
          <p key={i} className={`leading-relaxed text-white/75 ${i === 0 ? "text-xl text-white/90" : "mt-6"}`}>{p}</p>
        ))}
        <p className="mt-10">
          <Link href="/news" className="text-xs font-bold tracking-[0.16em] uppercase text-white/60 hover:text-white border-b border-white/20 pb-1">← All news</Link>
        </p>
      </article>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10 pb-16 grid gap-5 md:grid-cols-2">
        {related.map((r) => (
          <NewsCard key={r.slug} a={r} />
        ))}
      </div>
    </>
  );
}
