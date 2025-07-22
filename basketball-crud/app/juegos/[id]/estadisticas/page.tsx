"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, Award, Edit, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface EstadisticasJuego {
    juego: {
        codjuego: string
        Descripcion: string
        Fecha: string
        EquipoLocal: string
        EquipoVisitante: string
    }
    equipoLocal: {
        nombre: string
        jugadores: any[]
        totales: any
        esGanador: boolean
    }
    equipoVisitante: {
        nombre: string
        jugadores: any[]
        totales: any
        esGanador: boolean
    }
    empate: boolean
    resultadosOriginales: {
        equipoLocalStats: any[]
        equipoLocalTotal: any[]
        equipoVisitanteStats: any[]
        equipoVisitanteTotal: any[]
    }
}

interface EstadisticaDetallada {
    CodJuego: string
    CodEstadistica: string
    CodJugador: string
    Cantidad: number
    JugadorNumero: string
    EstadisticaDescripcion: string
}

export default function EstadisticasJuegoPage({ params }: { params: { id: string } }) {
    const [estadisticas, setEstadisticas] = useState<EstadisticasJuego | null>(null)
    const [estadisticasDetalladas, setEstadisticasDetalladas] = useState<EstadisticaDetallada[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [estadisticasRes, detalladasRes] = await Promise.all([
                    fetch(`/api/juegos/${params.id}/estadisticas`),
                    fetch(`/api/estadisticas-juego?search=${params.id}&limit=100`),
                ])

                if (estadisticasRes.ok) {
                    const data = await estadisticasRes.json()
                    setEstadisticas(data)
                } else {
                    const errorData = await estadisticasRes.json()
                    setError(errorData.error || "Error al cargar las estadísticas")
                }

                if (detalladasRes.ok) {
                    const detalladasData = await detalladasRes.json()
                    // Filtrar solo las estadísticas de este juego
                    const filtradas = detalladasData.data.filter((stat: any) => stat.CodJuego === params.id)
                    setEstadisticasDetalladas(filtradas)
                }
            } catch (error) {
                setError("Error de conexión")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.id])

    const handleDelete = async (codJuego: string, codEstadistica: string, codJugador: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar esta estadística?")) {
            try {
                await fetch(`/api/estadisticas-juego/${codJuego}/${codEstadistica}/${codJugador}`, {
                    method: "DELETE",
                })
                // Recargar los datos
                window.location.reload()
            } catch (error) {
                console.error("Error deleting estadistica:", error)
            }
        }
    }

    const getEstadisticaDetallada = (jugadorText: string, columna: string) => {
        // Extraer el número del jugador del texto "23 ñ Apellido Nombre"
        const numeroMatch = jugadorText.match(/^(\d+)\s+ñ/)
        if (!numeroMatch) return null

        const numero = numeroMatch[1]

        // Mapear columnas a códigos de estadística
        const mapeoColumnas: { [key: string]: string } = {
            Puntos: "01", // Asumiendo que puntos pueden venir de canastas de 2 puntos
            Asistencias: "03",
            Rebotes: "04",
            "Bolas Robadas": "05",
            "Faltas TÈcnicas": "07",
            "Bolas Perdidas": "08",
        }

        const codEstadistica = mapeoColumnas[columna]
        if (!codEstadistica) return null

        return estadisticasDetalladas.find(
            (stat) => stat.JugadorNumero === numero && stat.CodEstadistica === codEstadistica,
        )
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    if (error || !estadisticas) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/juegos">
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

    const { resultadosOriginales } = estadisticas
    const { equipoLocalStats, equipoLocalTotal, equipoVisitanteStats, equipoVisitanteTotal } = resultadosOriginales

    const renderEstadisticaCell = (jugador: any, columna: string, valor: number) => {
        if (jugador.Jugador === "Total:") {
            return <span className="font-bold">{valor || 0}</span>
        }

        const estadisticaDetallada = getEstadisticaDetallada(jugador.Jugador, columna)

        return (
            <div className="flex items-center justify-center space-x-2">
                <span>{valor || 0}</span>
                {estadisticaDetallada && (
                    <div className="flex space-x-1">
                        <Link
                            href={`/estadisticas-juego/${estadisticaDetallada.CodJuego}/${estadisticaDetallada.CodEstadistica}/${estadisticaDetallada.CodJugador}/editar`}
                        >
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Edit className="w-3 h-3" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={() =>
                                handleDelete(
                                    estadisticaDetallada.CodJuego,
                                    estadisticaDetallada.CodEstadistica,
                                    estadisticaDetallada.CodJugador,
                                )
                            }
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/juegos">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Juegos
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-orange-900">ESTADÍSTICAS DEL JUEGO</h1>
            </div>

            {/* Información del juego */}
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Award className="w-6 h-6 text-orange-600" />
                        <span>
                            JUEGO: {estadisticas.juego.codjuego} FECHA: {estadisticas.juego.Fecha}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-orange-600" />
                                <span className="font-medium">{estadisticas.juego.Descripcion}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center space-x-8">
                            <div
                                className={`text-lg font-bold ${estadisticas.equipoLocal.esGanador ? "text-yellow-600" : "text-gray-700"}`}
                            >
                                {estadisticas.equipoLocal.nombre}
                                {estadisticas.equipoLocal.esGanador && " (Ganador)"}
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                                {estadisticas.equipoLocal.totales.Puntos || 0} - {estadisticas.equipoVisitante.totales.Puntos || 0}
                            </div>
                            <div
                                className={`text-lg font-bold ${estadisticas.equipoVisitante.esGanador ? "text-yellow-600" : "text-gray-700"}`}
                            >
                                {estadisticas.equipoVisitante.nombre}
                                {estadisticas.equipoVisitante.esGanador && " (Ganador)"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Equipo Local */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Equipo Local: {estadisticas.equipoLocal.nombre}
                        {estadisticas.equipoLocal.esGanador && " (Ganador)"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jugador</TableHead>
                                    <TableHead className="text-center">Puntos</TableHead>
                                    <TableHead className="text-center">Asistencias</TableHead>
                                    <TableHead className="text-center">Rebotes</TableHead>
                                    <TableHead className="text-center">Bolas Robadas</TableHead>
                                    <TableHead className="text-center">Faltas TÈcnicas</TableHead>
                                    <TableHead className="text-center">Bolas Perdidas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {equipoLocalStats.map((jugador, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{jugador.Jugador}</TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Puntos", jugador.Puntos)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Asistencias", jugador.Asistencias)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Rebotes", jugador.Rebotes)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Bolas Robadas", jugador["Bolas Robadas"])}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Faltas TÈcnicas", jugador["Faltas TÈcnicas"])}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Bolas Perdidas", jugador["Bolas Perdidas"])}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {equipoLocalTotal.length > 0 && (
                                    <TableRow className="bg-orange-50 font-bold">
                                        <TableCell>{equipoLocalTotal[0].Jugador}</TableCell>
                                        <TableCell className="text-center">{equipoLocalTotal[0].Puntos || 0}</TableCell>
                                        <TableCell className="text-center">{equipoLocalTotal[0].Asistencias || 0}</TableCell>
                                        <TableCell className="text-center">{equipoLocalTotal[0].Rebotes || 0}</TableCell>
                                        <TableCell className="text-center">{equipoLocalTotal[0]["Bolas Robadas"] || 0}</TableCell>
                                        <TableCell className="text-center">{equipoLocalTotal[0]["Faltas TÈcnicas"] || 0}</TableCell>
                                        <TableCell className="text-center">{equipoLocalTotal[0]["Bolas Perdidas"] || 0}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Equipo Visitante */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Equipo Visitante: {estadisticas.equipoVisitante.nombre}
                        {estadisticas.equipoVisitante.esGanador && " (Ganador)"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jugador</TableHead>
                                    <TableHead className="text-center">Puntos</TableHead>
                                    <TableHead className="text-center">Asistencias</TableHead>
                                    <TableHead className="text-center">Rebotes</TableHead>
                                    <TableHead className="text-center">Bolas Robadas</TableHead>
                                    <TableHead className="text-center">Faltas TÈcnicas</TableHead>
                                    <TableHead className="text-center">Bolas Perdidas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {equipoVisitanteStats.map((jugador, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{jugador.Jugador}</TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Puntos", jugador.Puntos)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Asistencias", jugador.Asistencias)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Rebotes", jugador.Rebotes)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Bolas Robadas", jugador["Bolas Robadas"])}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Faltas TÈcnicas", jugador["Faltas TÈcnicas"])}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {renderEstadisticaCell(jugador, "Bolas Perdidas", jugador["Bolas Perdidas"])}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {equipoVisitanteTotal.length > 0 && (
                                    <TableRow className="bg-orange-50 font-bold">
                                        <TableCell>{equipoVisitanteTotal[0].Jugador}</TableCell>
                                        <TableCell className="text-center">{equipoVisitanteTotal[0].Puntos || 0}</TableCell>
                                        <TableCell className="text-center">{equipoVisitanteTotal[0].Asistencias || 0}</TableCell>
                                        <TableCell className="text-center">{equipoVisitanteTotal[0].Rebotes || 0}</TableCell>
                                        <TableCell className="text-center">{equipoVisitanteTotal[0]["Bolas Robadas"] || 0}</TableCell>
                                        <TableCell className="text-center">{equipoVisitanteTotal[0]["Faltas TÈcnicas"] || 0}</TableCell>
                                        <TableCell className="text-center">{equipoVisitanteTotal[0]["Bolas Perdidas"] || 0}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Acciones adicionales */}
            <div className="flex justify-center space-x-4">
                <Link href={`/estadisticas-juego/nuevo?juego=${params.id}`}>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Estadística
                    </Button>
                </Link>
                <Link href="/estadisticas-juego">
                    <Button variant="outline">Ver Todas las Estadísticas</Button>
                </Link>
            </div>
        </div>
    )
}
