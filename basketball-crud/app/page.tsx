import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  const modules = [
    {
      title: "Ciudades",
      description: "Gestiona las ciudades del sistema",
      href: "/ciudades",
      icon: "🏙️",
    },
    {
      title: "Equipos",
      description: "Administra los equipos de basketball",
      href: "/equipos",
      icon: "🏀",
    },
    {
      title: "Jugadores",
      description: "Gestiona los jugadores y sus datos",
      href: "/jugadores",
      icon: "👤",
    },
    {
      title: "Juegos",
      description: "Programa y gestiona los juegos",
      href: "/juegos",
      icon: "🏆",
    },
    {
      title: "Estadísticas",
      description: "Define tipos de estadísticas",
      href: "/estadisticas",
      icon: "📊",
    },
    {
      title: "Stats por Juego",
      description: "Registra estadísticas de cada juego",
      href: "/estadisticas-juego",
      icon: "📈",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-900 mb-4">🏀 Basketball Management System</h1>
        <p className="text-lg text-gray-600 mb-8">Sistema completo de gestión para equipos de basketball</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 hover:border-orange-400">
              <CardHeader>
                <div className="text-4xl mb-2">{module.icon}</div>
                <CardTitle className="text-orange-900">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center mt-16 p-8 bg-orange-50 rounded-lg">
        <h2 className="text-2xl font-semibold text-orange-900 mb-4">Desarrollado por</h2>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-lg font-medium text-orange-800">Samuel Olivo</div>
            <div className="text-sm text-gray-600">Desarrollador</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-orange-800">Miguel Rodríguez</div>
            <div className="text-sm text-gray-600">Desarrollador</div>
          </div>
        </div>
      </div>
    </div>
  )
}
