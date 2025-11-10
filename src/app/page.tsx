import Link from "next/link";
import { modules } from "@/data/modules";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="px-0 py-8 border-b">
        <h1 className="text-3xl font-semibold">Image Tools Web Portal</h1>
        <p className="text-gray-600 mt-2">A centralized hub for all image-related web tools collected from your workspace. Each tool is available as a module.</p>
      </section>

      <section id="modules" className="px-0 py-6">
        <h2 className="text-xl font-medium mb-3">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.slug} href={`/modules/${m.slug}`} className="block card p-4 hover:shadow-sm">
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-gray-600">{m.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsored section now provided globally in layout */}
    </main>
  );
}
