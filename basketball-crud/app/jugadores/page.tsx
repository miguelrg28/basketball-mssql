"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PaginatedResponse } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Edit, Trash2, User, AlertTriangle } from "lucide-react"

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState<PaginatedResponse<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [deleteError, setDeleteError] = useState("")

  const fetchJugadores = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      })
      const response = await fetch(`/api/jugadores?${params}`)
      const data = await response.json()
      setJugadores(data)
    } catch (error) {
      console.error("Error fetching jugadores:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJugadores()
  }, [page, search])

  const handleDelete = async (id: string, nombre: string) => {
    setDeleteError("")

    if (confirm(`¿Estás seguro de que quieres eliminar al jugador "${nombre}"?`)) {
      try {
        const response = await fetch(`/api/jugadores/${id}`, { method: "DELETE" })
        const data = await response.json()

        if (response.ok) {
          fetchJugadores()
        } else {
          if (data.errorType === "FOREIGN_KEY_CONSTRAINT") {
            setDeleteError(data.error)
          } else {
            setDeleteError(data.error || "Error al eliminar el jugador")
          }
        }
      } catch (error) {
        console.error("Error deleting jugador:", error)
        setDeleteError("Error de conexión al eliminar el jugador")
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-900">👤 Jugadores</h1>
        <Link href="/jugadores/nuevo">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Jugador
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
          <CardTitle>Gestión de Jugadores</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, apellido o número..."
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
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Fecha Nac.</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jugadores?.data.map((jugador: any) => (
                    <TableRow key={jugador.CodJugador}>
                      <TableCell>
                        <Badge variant="outline">{jugador.CodJugador}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-orange-600" />
                          <span>
                            {jugador.Nombre1} {jugador.Nombre2 && `${jugador.Nombre2} `}
                            {jugador.Apellido1} {jugador.Apellido2 || ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-100 text-orange-800">#{jugador.Numero}</Badge>
                      </TableCell>
                      <TableCell>{jugador.EquipoNombre || jugador.CodEquipo}</TableCell>
                      <TableCell>{formatDate(jugador.FechaNacim)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/jugadores/${jugador.CodJugador}/editar`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(jugador.CodJugador, `${jugador.Nombre1} ${jugador.Apellido1}`)}
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

              {jugadores && jugadores.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    Página {page} de {jugadores.totalPages}
                  </span>
                  <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === jugadores.totalPages}>
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
