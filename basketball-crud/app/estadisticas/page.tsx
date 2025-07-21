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
import { Search, Plus, Edit, Trash2, BarChart3 } from "lucide-react"

export default function EstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState<PaginatedResponse<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const fetchEstadisticas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      })
      const response = await fetch(`/api/estadisticas?${params}`)
      const data = await response.json()
      setEstadisticas(data)
    } catch (error) {
      console.error("Error fetching estadisticas:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstadisticas()
  }, [page, search])

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta estadística?")) {
      try {
        await fetch(`/api/estadisticas/${id}`, { method: "DELETE" })
        fetchEstadisticas()
      } catch (error) {
        console.error("Error deleting estadistica:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-900">📊 Estadísticas</h1>
        <Link href="/estadisticas/nuevo">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Estadística
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Estadísticas</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar estadísticas..."
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
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estadisticas?.data.map((estadistica: any) => (
                    <TableRow key={estadistica.CodEstadistica}>
                      <TableCell>
                        <Badge variant="outline">{estadistica.CodEstadistica}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-orange-600" />
                          <span>{estadistica.Descripcion}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{estadistica.Valor}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/estadisticas/${estadistica.CodEstadistica}/editar`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(estadistica.CodEstadistica)}
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

              {estadisticas && estadisticas.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {page} de {estadisticas.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === estadisticas.totalPages}
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
