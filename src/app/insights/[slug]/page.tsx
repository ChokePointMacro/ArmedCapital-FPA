import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, getAllSlugs } from "@/lib/posts";
import { mdxComponents } from "@/components/mdx";
import { CtaBand } from "@/components/CtaBand";
import { SITE } from "@/lib/content";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/insights/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/insights/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <article className="mx-auto max-w-2xl px-5 pt-16 sm:pt-20">
        <Link
          href="/insights"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> all insights
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
          <span className="text-accent">{post.category}</span>
          <span>·</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mt-3 font-mono text-2xl font-bold leading-tight text-fg sm:text-3xl">
          {post.title}
        </h1>

        <div className="mt-8 border-t border-border-hair pt-6">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border-hair pt-6">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border-hair px-2.5 py-1 font-mono text-xs text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>

      <CtaBand
        title="Put the theory to work."
        subtitle="See what a rolling forecast looks like on sample data, or estimate your own savings."
        primaryLabel="Start an Inquiry"
        secondaryLabel="Open the live demo"
        secondaryHref="/demo"
      />
    </>
  );
}
