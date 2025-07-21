"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PaginatedResponse } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Edit, Trash2, TrendingUp } from "lucide-react"

export default function EstadisticasJuegoPage() {
  const [estadisticasJuego, setEstadisticasJuego] = useState<PaginatedResponse<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const fetchEstadisticasJuego = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      })
      const response = await fetch(`/api/estadisticas-juego?${params}`)
      const data = await response.json()
      setEstadisticasJuego(data)
    } catch (error) {
      console.error("Error fetching estadisticas juego:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstadisticasJuego()
  }, [page, search])

  const handleDelete = async (codJuego: string, codEstadistica: string, codJugador: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta estadística?")) {
      try {
        await fetch(`/api/estadisticas-juego/${codJuego}/${codEstadistica}/${codJugador}`, { method: "DELETE" })
        fetchEstadisticasJuego()
      } catch (error) {
        console.error("Error deleting estadistica juego:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-900">📈 Estadísticas por Juego</h1>
        <Link href="/estadisticas-juego/nuevo">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Estadística
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Estadísticas por Juego</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por juego o jugador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Juego</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Estadística</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estadisticasJuego?.data.map((stat: any) => (
                    <TableRow key={`${stat.CodJuego}-${stat.CodEstadistica}-${stat.CodJugador}`}>
                      <TableCell>
                        <Badge variant="outline">{stat.JuegoDescripcion || stat.CodJuego}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                          <span>{stat.JugadorNombre || stat.CodJugador}</span>
                        </div>
                      </TableCell>
                      <TableCell>{stat.EquipoNombre}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {stat.EstadisticaDescripcion || stat.CodEstadistica}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{stat.Cantidad}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/estadisticas-juego/${stat.CodJuego}/${stat.CodEstadistica}/${stat.CodJugador}/editar`}
                          >
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(stat.CodJuego, stat.CodEstadistica, stat.CodJugador)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {estadisticasJuego && estadisticasJuego.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {page} de {estadisticasJuego.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === estadisticasJuego.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
