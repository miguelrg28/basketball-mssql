"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/ciudades", label: "Ciudades" },
  { href: "/equipos", label: "Equipos" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/juegos", label: "Juegos" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/estadisticas-juego", label: "Stats por Juego" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-orange-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🏀</div>
              <h1 className="text-xl font-bold">Basketball Manager</h1>
            </div>
          </Link>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-orange-700 text-white"
                    : "text-orange-100 hover:bg-orange-800 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
