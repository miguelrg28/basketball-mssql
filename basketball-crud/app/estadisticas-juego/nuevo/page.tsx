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
import { ArrowLeft, Save, Users, Trophy, BarChart3 } from "lucide-react"
import Link from "next/link"

interface JuegoOption {
    codjuego: string
    Descripcion: string
    Equipo1Nombre: string
    Equipo2Nombre: string
    Fecha: string
}

interface EstadisticaOption {
    CodEstadistica: string
    Descripcion: string
}

interface JugadorOption {
    CodJugador: string
    Nombre1: string
    Apellido1: string
    Numero: string
    CodEquipo: string
    EquipoNombre: string
}

export default function NuevaEstadisticaJuegoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [juegos, setJuegos] = useState<JuegoOption[]>([])
    const [estadisticas, setEstadisticas] = useState<EstadisticaOption[]>([])
    const [jugadores, setJugadores] = useState<JugadorOption[]>([])
    const [filteredJugadores, setFilteredJugadores] = useState<JugadorOption[]>([])
    const [selectedJuego, setSelectedJuego] = useState<JuegoOption | null>(null)

    const [formData, setFormData] = useState({
        CodJuego: "",
        CodEstadistica: "",
        CodJugador: "",
        Cantidad: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [juegosRes, estadisticasRes, jugadoresRes] = await Promise.all([
                    fetch("/api/juegos?limit=100"),
                    fetch("/api/estadisticas?limit=100"),
                    fetch("/api/jugadores?limit=100"),
                ])

                const juegosData = await juegosRes.json()
                const estadisticasData = await estadisticasRes.json()
                const jugadoresData = await jugadoresRes.json()

                setJuegos(juegosData.data || [])
                setEstadisticas(estadisticasData.data || [])
                setJugadores(jugadoresData.data || [])
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (formData.CodJuego && selectedJuego) {
            // Filtrar jugadores que pertenezcan a los equipos del juego seleccionado
            const filtered = jugadores.filter(
                (jugador) => jugador.CodEquipo === selectedJuego.Equipo1 || jugador.CodEquipo === selectedJuego.Equipo2,
            )
            setFilteredJugadores(filtered)
        } else {
            setFilteredJugadores([])
        }
    }, [formData.CodJuego, selectedJuego, jugadores])

    const handleJuegoChange = (value: string) => {
        const juego = juegos.find((j) => j.codjuego === value)
        setSelectedJuego(juego || null)
        setFormData({ ...formData, CodJuego: value, CodJugador: "" })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Validaciones
        if (!formData.CodJuego || !formData.CodEstadistica || !formData.CodJugador || !formData.Cantidad) {
            setError("Todos los campos son obligatorios")
            setLoading(false)
            return
        }

        const cantidadNum = Number.parseInt(formData.Cantidad)
        if (isNaN(cantidadNum) || cantidadNum < 0) {
            setError("La cantidad debe ser un número positivo")
            setLoading(false)
            return
        }

        try {
            const response = await fetch("/api/estadisticas-juego", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    Cantidad: cantidadNum,
                }),
            })

            if (response.ok) {
                const result = await response.json()

                // Mostrar mensaje específico según la acción
                if (result.action === "updated") {
                    alert(
                        `✅ Estadística actualizada exitosamente!\n\nValor anterior: ${result.previousValue}\nNuevo valor: ${cantidadNum}`,
                    )
                } else {
                    alert("✅ Nueva estadística creada exitosamente!")
                }

                router.push("/estadisticas-juego")
            } else {
                const data = await response.json()
                setError(data.error || "Error al crear/actualizar la estadística de juego")
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

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/estadisticas-juego">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-orange-900">Registrar Estadística de Juego</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-orange-600" />
                                <span>Registrar/Actualizar Estadística</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="juego">Juego *</Label>
                                    <Select value={formData.CodJuego} onValueChange={handleJuegoChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar juego" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {juegos.map((juego) => (
                                                <SelectItem key={juego.codjuego} value={juego.codjuego}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{juego.Descripcion}</span>
                                                        <span className="text-sm text-gray-500">
                                                            {juego.Equipo1Nombre} vs {juego.Equipo2Nombre} - {formatDate(juego.Fecha)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estadistica">Tipo de Estadística *</Label>
                                    <Select
                                        value={formData.CodEstadistica}
                                        onValueChange={(value) => setFormData({ ...formData, CodEstadistica: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estadística" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {estadisticas.map((estadistica) => (
                                                <SelectItem key={estadistica.CodEstadistica} value={estadistica.CodEstadistica}>
                                                    {estadistica.Descripcion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jugador">Jugador *</Label>
                                    <Select
                                        value={formData.CodJugador}
                                        onValueChange={(value) => setFormData({ ...formData, CodJugador: value })}
                                        disabled={!formData.CodJuego}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={formData.CodJuego ? "Seleccionar jugador" : "Primero selecciona un juego"}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredJugadores.map((jugador) => (
                                                <SelectItem key={jugador.CodJugador} value={jugador.CodJugador}>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-mono text-sm bg-orange-100 px-2 py-1 rounded">#{jugador.Numero}</span>
                                                        <span>
                                                            {jugador.Nombre1} {jugador.Apellido1}
                                                        </span>
                                                        <span className="text-sm text-gray-500">({jugador.EquipoNombre})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cantidad">Cantidad *</Label>
                                    <Input
                                        id="cantidad"
                                        type="number"
                                        min="0"
                                        value={formData.Cantidad}
                                        onChange={(e) => setFormData({ ...formData, Cantidad: e.target.value })}
                                        placeholder="Ej: 15"
                                        required
                                    />
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertDescription className="text-blue-800">
                                        💡 <strong>Nota:</strong> Si ya existe una estadística para este jugador en este juego, se
                                        actualizará con el nuevo valor. Si no existe, se creará una nueva.
                                    </AlertDescription>
                                </Alert>

                                <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
                                    {loading ? (
                                        "Procesando..."
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Registrar Estadística
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {selectedJuego && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Trophy className="w-5 h-5 text-orange-600" />
                                    <span>Información del Juego</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Descripción</Label>
                                    <p className="font-medium">{selectedJuego.Descripcion}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                                    <p>{formatDate(selectedJuego.Fecha)}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Equipos</Label>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span>{selectedJuego.Equipo1Nombre} (Local)</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span>{selectedJuego.Equipo2Nombre} (Visitante)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {filteredJugadores.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-orange-600" />
                                    <span>Jugadores Disponibles</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {filteredJugadores.map((jugador) => (
                                        <div
                                            key={jugador.CodJugador}
                                            className="flex items-center justify-between p-2 rounded border hover:bg-gray-50"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">#{jugador.Numero}</span>
                                                <span className="text-sm">
                                                    {jugador.Nombre1} {jugador.Apellido1}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">{jugador.EquipoNombre}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
