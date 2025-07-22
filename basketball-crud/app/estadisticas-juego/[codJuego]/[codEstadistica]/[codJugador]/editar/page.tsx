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
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, User, Trophy, BarChart3, Calendar } from "lucide-react"
import Link from "next/link"

interface EstadisticaJuegoDetalle {
    CodJuego: string
    CodEstadistica: string
    CodJugador: string
    Cantidad: number
    JuegoDescripcion: string
    JuegoFecha: string
    EstadisticaDescripcion: string
    JugadorNombre: string
    JugadorNumero: string
    EquipoNombre: string
}

export default function EditarEstadisticaJuegoPage({
    params,
}: {
    params: { codJuego: string; codEstadistica: string; codJugador: string }
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState("")
    const [estadistica, setEstadistica] = useState<EstadisticaJuegoDetalle | null>(null)
    const [cantidad, setCantidad] = useState("")

    useEffect(() => {
        const fetchEstadistica = async () => {
            try {
                const response = await fetch(
                    `/api/estadisticas-juego/${params.codJuego}/${params.codEstadistica}/${params.codJugador}`,
                )

                if (response.ok) {
                    const data = await response.json()
                    setEstadistica(data)
                    setCantidad(data.Cantidad.toString())
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
    }, [params.codJuego, params.codEstadistica, params.codJugador])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const cantidadNum = Number.parseInt(cantidad)
        if (isNaN(cantidadNum) || cantidadNum < 0) {
            setError("La cantidad debe ser un número positivo")
            setLoading(false)
            return
        }

        try {
            const response = await fetch(
                `/api/estadisticas-juego/${params.codJuego}/${params.codEstadistica}/${params.codJugador}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Cantidad: cantidadNum }),
                },
            )

            if (response.ok) {
                router.push("/estadisticas-juego")
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES")
    }

    if (loadingData) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!estadistica) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/estadisticas-juego">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-orange-900">Error</h1>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/estadisticas-juego">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-orange-900">Editar Estadística de Juego</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-orange-600" />
                                <span>Editar Estadística</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Código Juego</Label>
                                        <Input value={estadistica.CodJuego} disabled className="bg-gray-100" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Código Estadística</Label>
                                        <Input value={estadistica.CodEstadistica} disabled className="bg-gray-100" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Código Jugador</Label>
                                        <Input value={estadistica.CodJugador} disabled className="bg-gray-100" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cantidad">Cantidad *</Label>
                                    <Input
                                        id="cantidad"
                                        type="number"
                                        min="0"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(e.target.value)}
                                        placeholder="Cantidad"
                                        required
                                    />
                                </div>

                                <div className="flex space-x-4">
                                    <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                                        {loading ? (
                                            "Actualizando..."
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Actualizar Estadística
                                            </>
                                        )}
                                    </Button>

                                    <Link href={`/juegos/${estadistica.CodJuego}/estadisticas`}>
                                        <Button variant="outline">Ver Reporte del Juego</Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Trophy className="w-5 h-5 text-orange-600" />
                                <span>Información del Juego</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Juego</Label>
                                <p className="font-medium">{estadistica.JuegoDescripcion}</p>
                                <Badge variant="outline" className="mt-1">
                                    {estadistica.CodJuego}
                                </Badge>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                    <span>{formatDate(estadistica.JuegoFecha)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-orange-600" />
                                <span>Información del Jugador</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Jugador</Label>
                                <p className="font-medium">{estadistica.JugadorNombre}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge className="bg-orange-100 text-orange-800">#{estadistica.JugadorNumero}</Badge>
                                    <Badge variant="outline">{estadistica.CodJugador}</Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Equipo</Label>
                                <p>{estadistica.EquipoNombre}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-orange-600" />
                                <span>Tipo de Estadística</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Estadística</Label>
                                <p className="font-medium">{estadistica.EstadisticaDescripcion}</p>
                                <Badge variant="outline" className="mt-1">
                                    {estadistica.CodEstadistica}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
