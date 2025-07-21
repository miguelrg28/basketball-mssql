"use client"

import type React from "react"
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Estadistica } from "@/lib/types"

export default function EditarEstadisticaPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState<Estadistica>({
        CodEstadistica: "",
        Descripcion: "",
        Valor: 0,
    })

    useEffect(() => {
        const fetchEstadistica = async () => {
            try {
                const response = await fetch(`/api/estadisticas/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setFormData(data)
                } else {
                    setError("Estadística no encontrada")
                }
            } catch (error) {
                setError("Error al cargar la estadística")
            } finally {
                setLoadingData(false)
            }
        }

        fetchEstadistica()
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (!formData.Descripcion || formData.Valor === undefined) {
            setError("Todos los campos son obligatorios")
            setLoading(false)
            return
        }

        if (formData.Valor < 0 || formData.Valor > 255) {
            setError("El valor debe estar entre 0 y 255")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`/api/estadisticas/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                router.push("/estadisticas")
            } else {
                const data = await response.json()
                setError(data.error || "Error al actualizar la estadística")
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
                <Link href="/estadisticas">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-orange-900">Editar Estadística</h1>
            </div>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Editar Estadística: {formData.CodEstadistica}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código Estadística</Label>
                            <Input id="codigo" value={formData.CodEstadistica} disabled className="bg-gray-100" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción *</Label>
                            <Input
                                id="descripcion"
                                value={formData.Descripcion}
                                onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                                maxLength={25}
                                placeholder="Descripción de la estadística"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor (0-255) *</Label>
                            <Input
                                id="valor"
                                type="number"
                                min="0"
                                max="255"
                                value={formData.Valor}
                                onChange={(e) => setFormData({ ...formData, Valor: Number.parseInt(e.target.value) || 0 })}
                                placeholder="Valor de la estadística"
                                required
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
                            {loading ? (
                                "Actualizando..."
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Actualizar Estadística
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
