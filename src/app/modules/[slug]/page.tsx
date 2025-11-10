import Link from "next/link";
import ClientModuleRenderer from "./ClientModuleRenderer";
import { modules } from "@/data/modules";

type Props = { params: Promise<{ slug: string }> };

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
      <h1 className="text-2xl font-semibold">{mod.title}</h1>
      <p className="text-gray-600 mt-2">{mod.description}</p>

      <div className="card p-4 mt-6">
        <ClientModuleRenderer slug={slug} />
      </div>

      {/* Sponsored section now provided globally in layout */}

      <Link href="/" className="text-blue-600 mt-6 inline-block">Back to Home</Link>
    </main>
  );
}