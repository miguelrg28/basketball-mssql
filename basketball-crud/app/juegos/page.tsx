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
import { Search, Plus, Edit, Trash2, Calendar } from "lucide-react"

export default function JuegosPage() {
  const [juegos, setJuegos] = useState<PaginatedResponse<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const fetchJuegos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      })
      const response = await fetch(`/api/juegos?${params}`)
      const data = await response.json()
      setJuegos(data)
    } catch (error) {
      console.error("Error fetching juegos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJuegos()
  }, [page, search])

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este juego?")) {
      try {
        await fetch(`/api/juegos/${id}`, { method: "DELETE" })
        fetchJuegos()
      } catch (error) {
        console.error("Error deleting juego:", error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-900">🏆 Juegos</h1>
        <Link href="/juegos/nuevo">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Juego
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Juegos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar juegos..."
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
                    <TableHead>Código</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Equipos</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {juegos?.data.map((juego: any) => (
                    <TableRow key={juego.CodJuego}>
                      <TableCell>
                        <Badge variant="outline">{juego.CodJuego}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{juego.Descripcion}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-800">{juego.Equipo1Nombre || juego.Equipo1}</Badge>
                          <span className="text-gray-500">vs</span>
                          <Badge className="bg-red-100 text-red-800">{juego.Equipo2Nombre || juego.Equipo2}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>{formatDate(juego.Fecha)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/juegos/${juego.CodJuego}/editar`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(juego.CodJuego)}
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

              {juegos && juegos.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {page} de {juegos.totalPages}
                  </span>
                  <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === juegos.totalPages}>
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
