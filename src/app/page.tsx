import Link from "next/link";
import { modules } from "@/data/modules";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-8 bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <section className="px-0 pb-8 border-b">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Image Tools Web Portal</h1>
        <p className="text-gray-700 mt-2">A centralized hub for all image-related web tools collected from your workspace. Each tool is available as a module.</p>
      </section>

      <section id="modules" className="px-0 py-6">
        <h2 className="text-xl font-medium mb-4">Modules</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.slug}
              href={`/modules/${m.slug}`}
              className="block rounded-lg border bg-white/90 hover:bg-white p-4 shadow-sm hover:shadow-md transition-colors"
            >
              <div className="font-medium text-indigo-700">{m.title}</div>
              <div className="text-sm text-gray-600">{m.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sponsored section now provided globally in layout */}
    </main>
  );
}
