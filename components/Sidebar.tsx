import Link from "next/link"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/interviews", label: "Entrevistas" },
  { href: "/observations", label: "Observación" },
  { href: "/documents", label: "Análisis documental" },
  { href: "/triangulation", label: "Triangulación" },
]

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-72 border-r border-slate-200 bg-slate-950 p-6 text-white">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Proyecto de tesis
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight">
          Instrumentos
        </h2>
      </div>

      <nav className="mt-10 flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}