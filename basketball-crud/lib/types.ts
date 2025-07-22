export interface Ciudad {
    CodCiudad: string
    Nombre: string
}

export interface Equipo {
    CodEquipo: string
    Nombre: string
    CodCiudad: string
    Ciudad?: Ciudad
}

export interface Jugador {
    CodJugador: string
    Nombre1: string
    Apellido1: string
    Nombre2?: string
    Apellido2?: string
    CiudadNacim: string
    FechaNacim: string
    Numero: string
    CodEquipo: string
    Equipo?: Equipo
    Ciudad?: Ciudad
}

export interface Juego {
    codjuego?: string
    Descripcion: string
    Equipo1: string
    Equipo2: string
    Fecha: string
    EquipoLocal?: Equipo
    EquipoVisitante?: Equipo
}

export interface Estadistica {
    CodEstadistica: string
    Descripcion: string
    Valor: number
}

export interface EstadisticaJuego {
    CodJuego: string
    CodEstadistica: string
    CodJugador: string
    Cantidad: number
    Juego?: Juego
    Estadistica?: Estadistica
    Jugador?: Jugador
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}
