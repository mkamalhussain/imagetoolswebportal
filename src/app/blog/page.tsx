import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts, formatPostDate } from "@/data/blogPosts";

export const metadata: Metadata = {
  title: "Blog – Practical Guides for Images, Video, Audio & PDFs",
  description:
    "Step-by-step guides and tips from the FreeToolBox team: compress PDFs without losing quality, resize images for social media, convert formats, and get more out of every free online tool.",
  keywords: [
    "free online tools blog",
    "how to compress pdf",
    "social media image sizes",
    "image editing tips",
    "pdf tips",
  ],
  openGraph: {
    title: "FreeToolBox Blog – Practical Guides for Images, Video, Audio & PDFs",
    description:
      "Step-by-step guides and tips: compress PDFs, resize images for social media, convert formats, and more.",
    type: "website",
    url: "https://freetoolbox.app/blog",
  },
  twitter: {
    card: "summary",
    title: "FreeToolBox Blog – Practical Guides",
    description:
      "Step-by-step guides and tips: compress PDFs, resize images for social media, convert formats, and more.",
  },
  alternates: {
    canonical: "https://freetoolbox.app/blog",
  },
};

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Practical guides for getting the most out of your images, videos, audio, and
            documents — written by the FreeToolBox team.
          </p>
        </header>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                  {post.category}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatPostDate(post.date)}
                </span>
                <span className="text-gray-400 dark:text-gray-600">·</span>
                <span className="text-gray-500 dark:text-gray-400">{post.readTime}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/how-to"
            className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Browse all step-by-step tool guides →
          </Link>
        </div>
      </div>
    </div>
  );
}
