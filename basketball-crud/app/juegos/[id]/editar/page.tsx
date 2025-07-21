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
import type { Juego, Equipo } from "@/lib/types"

export default function EditarJuegoPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState("")
    const [equipos, setEquipos] = useState<Equipo[]>([])
    const [formData, setFormData] = useState<Juego>({
        CodJuego: "",
        Descripcion: "",
        Equipo1: "",
        Equipo2: "",
        Fecha: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [juegoRes, equiposRes] = await Promise.all([
                    fetch(`/api/juegos/${params.id}`),
                    fetch("/api/equipos?limit=100"),
                ])

                if (juegoRes.ok) {
                    const juegoData = await juegoRes.json()
                    // Formatear la fecha para el input date
                    if (juegoData.Fecha) {
                        juegoData.Fecha = new Date(juegoData.Fecha).toISOString().split("T")[0]
                    }
                    setFormData(juegoData)
                } else {
                    setError("Juego no encontrado")
                }

                const equiposData = await equiposRes.json()
                setEquipos(equiposData.data || [])
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

        if (!formData.Descripcion || !formData.Equipo1 || !formData.Equipo2 || !formData.Fecha) {
            setError("Todos los campos son obligatorios")
            setLoading(false)
            return
        }

        if (formData.Equipo1 === formData.Equipo2) {
            setError("Los equipos deben ser diferentes")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`/api/juegos/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                router.push("/juegos")
            } else {
                const data = await response.json()
                setError(data.error || "Error al actualizar el juego")
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
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/juegos">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-orange-900">Editar Juego</h1>
            </div>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Editar Juego: {formData.CodJuego}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código Juego</Label>
                            <Input id="codigo" value={formData.CodJuego} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción *</Label>
                            <Input
                                id="descripcion"
                                value={formData.Descripcion}
                                onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                                maxLength={25}
                                placeholder="Descripción del juego"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fecha">Fecha del Juego *</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={formData.Fecha}
                                onChange={(e) => setFormData({ ...formData, Fecha: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="equipo1">Equipo Local *</Label>
                            <Select value={formData.Equipo1} onValueChange={(value) => setFormData({ ...formData, Equipo1: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar equipo local" />
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

                        <div className="space-y-2">
                            <Label htmlFor="equipo2">Equipo Visitante *</Label>
                            <Select value={formData.Equipo2} onValueChange={(value) => setFormData({ ...formData, Equipo2: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar equipo visitante" />
                                </SelectTrigger>
                                <SelectContent>
                                    {equipos
                                        .filter((equipo) => equipo.CodEquipo !== formData.Equipo1)
                                        .map((equipo) => (
                                            <SelectItem key={equipo.CodEquipo} value={equipo.CodEquipo}>
                                                {equipo.Nombre}
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
                                    Actualizar Juego
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
