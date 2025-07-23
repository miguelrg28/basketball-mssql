"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Ciudad, PaginatedResponse } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"

export default function CiudadesPage() {
  const [ciudades, setCiudades] = useState<PaginatedResponse<Ciudad> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [deleteError, setDeleteError] = useState("")

  const fetchCiudades = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      })
      const response = await fetch(`/api/ciudades?${params}`)
      const data = await response.json()
      setCiudades(data)
    } catch (error) {
      console.error("Error fetching ciudades:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCiudades()
  }, [page, search])

  const handleDelete = async (id: string, nombre: string) => {
    setDeleteError("")

    if (confirm(`¿Estás seguro de que quieres eliminar la ciudad "${nombre}"?`)) {
      try {
        const response = await fetch(`/api/ciudades/${id}`, { method: "DELETE" })
        const data = await response.json()

        if (response.ok) {
          fetchCiudades()
        } else {
          if (data.errorType === "FOREIGN_KEY_CONSTRAINT") {
            setDeleteError(data.error)
          } else {
            setDeleteError(data.error || "Error al eliminar la ciudad")
          }
        }
      } catch (error) {
        console.error("Error deleting ciudad:", error)
        setDeleteError("Error de conexión al eliminar la ciudad")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-900">🏙️ Ciudades</h1>
        <Link href="/ciudades/nuevo">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Ciudad
          </Button>
        </Link>
      </div>

      {deleteError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{deleteError}</AlertDescription>
          <Button variant="outline" size="sm" className="mt-2 bg-transparent w-fit" onClick={() => setDeleteError("")}>
            Cerrar
          </Button>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Ciudades</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar ciudades..."
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
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ciudades?.data.map((ciudad) => (
                    <TableRow key={ciudad.CodCiudad}>
                      <TableCell>
                        <Badge variant="outline">{ciudad.CodCiudad}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{ciudad.Nombre}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/ciudades/${ciudad.CodCiudad}/editar`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(ciudad.CodCiudad, ciudad.Nombre)}
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

              {ciudades && ciudades.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {page} de {ciudades.totalPages}
                  </span>
                  <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === ciudades.totalPages}>
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
