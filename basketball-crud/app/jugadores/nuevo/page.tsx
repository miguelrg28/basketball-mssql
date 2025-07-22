"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Ciudad, Equipo } from "@/lib/types"

export default function NuevoJugadorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [formData, setFormData] = useState({
    Nombre1: "",
    Apellido1: "",
    Nombre2: "",
    Apellido2: "",
    CiudadNacim: "",
    FechaNacim: "",
    Numero: "",
    CodEquipo: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ciudadesRes, equiposRes] = await Promise.all([
          fetch("/api/ciudades?limit=100"),
          fetch("/api/equipos?limit=100"),
        ])

        const ciudadesData = await ciudadesRes.json()
        const equiposData = await equiposRes.json()

        setCiudades(ciudadesData.data || [])
        setEquipos(equiposData.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones
    if (
      !formData.Nombre1 ||
      !formData.Apellido1 ||
      !formData.CiudadNacim ||
      !formData.FechaNacim ||
      !formData.Numero ||
      !formData.CodEquipo
    ) {
      setError("Los campos marcados con * son obligatorios")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/jugadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/jugadores")
      } else {
        const data = await response.json()
        setError(data.error || "Error al crear el jugador")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/jugadores">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-900">Nuevo Jugador</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Crear Nuevo Jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.Numero}
                  onChange={(e) => setFormData({ ...formData, Numero: e.target.value })}
                  maxLength={4}
                  placeholder="Ej: 23"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre1">Primer Nombre *</Label>
                <Input
                  id="nombre1"
                  value={formData.Nombre1}
                  onChange={(e) => setFormData({ ...formData, Nombre1: e.target.value })}
                  maxLength={15}
                  placeholder="Primer nombre"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre2">Segundo Nombre</Label>
                <Input
                  id="nombre2"
                  value={formData.Nombre2}
                  onChange={(e) => setFormData({ ...formData, Nombre2: e.target.value })}
                  maxLength={15}
                  placeholder="Segundo nombre (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido1">Primer Apellido *</Label>
                <Input
                  id="apellido1"
                  value={formData.Apellido1}
                  onChange={(e) => setFormData({ ...formData, Apellido1: e.target.value })}
                  maxLength={15}
                  placeholder="Primer apellido"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido2">Segundo Apellido</Label>
                <Input
                  id="apellido2"
                  value={formData.Apellido2}
                  onChange={(e) => setFormData({ ...formData, Apellido2: e.target.value })}
                  maxLength={15}
                  placeholder="Segundo apellido (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacim">Fecha de Nacimiento *</Label>
                <Input
                  id="fechaNacim"
                  type="date"
                  value={formData.FechaNacim}
                  onChange={(e) => setFormData({ ...formData, FechaNacim: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ciudadNacim">Ciudad de Nacimiento *</Label>
                <Select
                  value={formData.CiudadNacim}
                  onValueChange={(value) => setFormData({ ...formData, CiudadNacim: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {ciudades.map((ciudad) => (
                      <SelectItem key={ciudad.CodCiudad} value={ciudad.CodCiudad}>
                        {ciudad.Nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="equipo">Equipo *</Label>
                <Select
                  value={formData.CodEquipo}
                  onValueChange={(value) => setFormData({ ...formData, CodEquipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((equipo) => (
                      <SelectItem key={equipo.CodEquipo} value={equipo.CodEquipo}>
                        {equipo.Nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Jugador
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
