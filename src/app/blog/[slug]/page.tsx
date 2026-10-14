import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts, formatPostDate, type BlogBlock } from "@/data/blogPosts";
import { getToolPath } from "@/data/toolPaths";
import { modules } from "@/data/modules";
import { audioModules } from "@/data/audioModules";
import { videoModules } from "@/data/videoModules";
import { pdfModules } from "@/data/pdfModules";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const allToolModules = [...modules, ...audioModules, ...videoModules, ...pdfModules];

function findTool(slug: string) {
  return allToolModules.find((m) => m.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://freetoolbox.app/blog/${post.slug}`,
      publishedTime: post.date,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://freetoolbox.app/blog/${post.slug}`,
    },
  };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

function renderBlock(block: BlogBlock, index: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          key={index}
          className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4"
        >
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul
          key={index}
          className="list-disc pl-6 space-y-2 mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"
        >
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={index}
          className="list-decimal pl-6 space-y-2 mb-4 text-gray-700 dark:text-gray-300 leading-relaxed"
        >
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <div
          key={index}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> {block.text}
          </p>
        </div>
      );
    case "cta": {
      const tool = findTool(block.toolSlug);
      const href = getToolPath(block.toolSlug);
      if (!tool || !href) return null;
      return (
        <Link
          key={index}
          href={href}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-4 my-6 transition-colors"
        >
          <span className="font-medium">{block.text}</span>
          <span className="font-semibold whitespace-nowrap">Open {tool.title} →</span>
        </Link>
      );
    }
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn&apos;t find the article you were looking for.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `https://freetoolbox.app/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://freetoolbox.app/blog/${post.slug}`,
    },
    author: {
      "@type": "Organization",
      name: "FreeToolBox.app",
      url: "https://freetoolbox.app",
    },
    publisher: {
      "@type": "Organization",
      name: "FreeToolBox.app",
      url: "https://freetoolbox.app",
      logo: {
        "@type": "ImageObject",
        url: "https://freetoolbox.app/logo.png",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Blog
          </Link>
          <span className="mx-2 text-gray-400">→</span>
          <span className="text-gray-600 dark:text-gray-400">{post.category}</span>
        </nav>

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
              {post.category}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatPostDate(post.date)}
            </span>
            <span className="text-gray-400 dark:text-gray-600">·</span>
            <span className="text-gray-500 dark:text-gray-400">{post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>
        </header>

        {/* Body */}
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          {post.intro.map((paragraph, i) => (
            <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
          {post.blocks.map((block, i) => renderBlock(block, i))}
        </article>

        {/* Related guides */}
        {post.relatedGuides.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prefer a visual walkthrough? Read the complete step-by-step{" "}
              {post.relatedGuides.map((guideSlug, i) => {
                const tool = findTool(guideSlug);
                return (
                  <span key={guideSlug}>
                    {i > 0 && ", "}
                    <Link
                      href={`/how-to/${guideSlug}`}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {tool ? tool.title : guideSlug} guide
                    </Link>
                  </span>
                );
              })}
              .
            </p>
          </div>
        )}

        {/* Tools mentioned */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Tools mentioned in this article
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {post.relatedTools.map((toolSlug) => {
              const tool = findTool(toolSlug);
              const href = getToolPath(toolSlug);
              if (!tool || !href) return null;
              return (
                <Link
                  key={toolSlug}
                  href={href}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 hover:shadow-lg transition-shadow group"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {tool.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* More posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              More from the blog
            </h2>
            <div className="space-y-4">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl shadow p-5 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPostDate(p.date)} · {p.readTime}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ← Back to all articles
          </Link>
        </div>
      </div>
    </div>
  );
}
