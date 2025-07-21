"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Ciudad } from "@/lib/types"

export default function EditarCiudadPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<Ciudad>({
    CodCiudad: "",
    Nombre: "",
  })

  useEffect(() => {
    const fetchCiudad = async () => {
      try {
        const response = await fetch(`/api/ciudades/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setFormData(data)
        } else {
          setError("Ciudad no encontrada")
        }
      } catch (error) {
        setError("Error al cargar la ciudad")
      } finally {
        setLoadingData(false)
      }
    }

    fetchCiudad()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.Nombre) {
      setError("El nombre es obligatorio")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/ciudades/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/ciudades")
      } else {
        const data = await response.json()
        setError(data.error || "Error al actualizar la ciudad")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-orange-900">Editar Ciudad</h1>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Editar Ciudad: {formData.CodCiudad}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" value={formData.CodCiudad} disabled className="bg-gray-100" />
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
                "Actualizando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Actualizar Ciudad
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
