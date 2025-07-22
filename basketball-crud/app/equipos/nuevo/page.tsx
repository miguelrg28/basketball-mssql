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
import type { Ciudad } from "@/lib/types"

export default function NuevoEquipoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [formData, setFormData] = useState({
    Nombre: "",
    CodCiudad: "",
  })

  useEffect(() => {
    const fetchCiudades = async () => {
      try {
        const response = await fetch("/api/ciudades?limit=100")
        const data = await response.json()
        setCiudades(data.data || [])
      } catch (error) {
        console.error("Error fetching ciudades:", error)
      }
    }

    fetchCiudades()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones

    try {
      const response = await fetch("/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/equipos")
      } else {
        const data = await response.json()
        setError(data.error || "Error al crear el equipo")
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
        <Link href="/equipos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-900">Nuevo Equipo</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Crear Nuevo Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Equipo *</Label>
              <Input
                id="nombre"
                value={formData.Nombre}
                onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                maxLength={25}
                placeholder="Nombre del equipo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Select
                value={formData.CodCiudad}
                onValueChange={(value) => setFormData({ ...formData, CodCiudad: value })}
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

            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Equipo
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
