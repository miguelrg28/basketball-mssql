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
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Equipo, Ciudad } from "@/lib/types"

export default function EditarEquipoPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState("")
    const [ciudades, setCiudades] = useState<Ciudad[]>([])
    const [formData, setFormData] = useState<Equipo>({
        CodEquipo: "",
        Nombre: "",
        CodCiudad: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equipoRes, ciudadesRes] = await Promise.all([
                    fetch(`/api/equipos/${params.id}`),
                    fetch("/api/ciudades?limit=100"),
                ])

                if (equipoRes.ok) {
                    const equipoData = await equipoRes.json()
                    setFormData(equipoData)
                } else {
                    setError("Equipo no encontrado")
                }

                const ciudadesData = await ciudadesRes.json()
                setCiudades(ciudadesData.data || [])
            } catch (error) {
                setError("Error al cargar los datos")
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (!formData.Nombre || !formData.CodCiudad) {
            setError("Todos los campos son obligatorios")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`/api/equipos/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                router.push("/equipos")
            } else {
                const data = await response.json()
                setError(data.error || "Error al actualizar el equipo")
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
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
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
                <h1 className="text-3xl font-bold text-orange-900">Editar Equipo</h1>
            </div>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Editar Equipo: {formData.CodEquipo}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código Equipo</Label>
                            <Input id="codigo" value={formData.CodEquipo} disabled className="bg-gray-100" />
                        </div>

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
                                "Actualizando..."
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Actualizar Equipo
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
