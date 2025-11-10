import Link from "next/link";
import ClientModuleRenderer from "./ClientModuleRenderer";
import { modules } from "@/data/modules";
import AdSense from "@/components/AdSense";

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

      <section id="sponsored" className="px-0 py-6 border-t mt-6">
        <h2 className="text-xl font-medium mb-3">Sponsored</h2>
        <div className="card p-2">
          <AdSense className="w-full" style={{ display: 'block', minHeight: 120 }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Configure AdSense via NEXT_PUBLIC_ADS_CLIENT and NEXT_PUBLIC_ADS_SLOT.</p>
      </section>

      <Link href="/" className="text-blue-600 mt-6 inline-block">Back to Home</Link>
    </main>
  );
}