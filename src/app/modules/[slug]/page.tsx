import Link from "next/link";
import ClientModuleRenderer from "./ClientModuleRenderer";
import { modules } from "@/data/modules";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const module = modules.find(m => m.slug === slug);

  if (!module) {
    return {
      title: "Tool Not Found | Free Tools",
      description: "The requested tool could not be found.",
    };
  }

  return {
    title: `${module.title} | Free Tools`,
    description: module.description,
    keywords: [
      module.title.toLowerCase(),
      "free online tool",
      "image processing",
      slug.replace('-', ' '),
      "online tool",
      "free tool"
    ],
    openGraph: {
      title: `${module.title} - Free Online Tool`,
      description: module.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${module.title} - Free Online Tool`,
      description: module.description,
    },
  };
}

export default async function ModulePage({ params }: Props) {
  const { slug } = await params;
  const mod = modules.find((m) => m.slug === slug);

  if (!mod) {
    return (
      <main className="min-h-screen">
        <h1 className="text-2xl font-semibold">Module Not Found</h1>
        <p className="text-gray-600 mt-2">The requested module "{slug}" does not exist.</p>
        <Link href="/" className="text-blue-600 mt-4 inline-block">Back to Home</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {mod.title}
          </h1>
          <p className="text-gray-600 mt-2">{mod.description}</p>
        </div>
        <Link href="/" className="text-blue-600">Back to Home</Link>
      </div>
      <hr className="my-4" />

      <div className="card p-4 mt-6">
        <ClientModuleRenderer slug={slug} />
      </div>
      {/* Sponsored section provided globally in layout */}
    </main>
  );
}