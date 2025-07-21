"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NuevaCiudadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    CodCiudad: "",
    Nombre: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones
    if (!formData.CodCiudad || !formData.Nombre) {
      setError("Todos los campos son obligatorios")
      setLoading(false)
      return
    }

    if (formData.CodCiudad.length !== 3) {
      setError("El código debe tener exactamente 3 caracteres")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/ciudades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/ciudades")
      } else {
        const data = await response.json()
        setError(data.error || "Error al crear la ciudad")
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
        <Link href="/ciudades">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-900">Nueva Ciudad</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Crear Nueva Ciudad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="codigo">Código (3 caracteres)</Label>
              <Input
                id="codigo"
                value={formData.CodCiudad}
                onChange={(e) => setFormData({ ...formData, CodCiudad: e.target.value.toUpperCase() })}
                maxLength={3}
                placeholder="Ej: MED"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.Nombre}
                onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                maxLength={25}
                placeholder="Nombre de la ciudad"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Ciudad
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
