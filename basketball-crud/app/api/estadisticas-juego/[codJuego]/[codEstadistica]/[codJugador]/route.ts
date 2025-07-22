import { type NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { codJuego: string; codEstadistica: string; codJugador: string } }
) {
    try {
        const pool = await getConnection()
        const result = await pool
            .request()
            .input('CodJuego', sql.NChar(6), params.codJuego)
            .input('CodEstadistica', sql.NChar(5), params.codEstadistica)
            .input('CodJugador', sql.NChar(5), params.codJugador).query(`
        SELECT ej.*, 
               j.Descripcion as JuegoDescripcion,
               j.Fecha as JuegoFecha,
               e.Descripcion as EstadisticaDescripcion,
               ju.Nombre1 + ' ' + ju.Apellido1 as JugadorNombre,
               ju.Numero as JugadorNumero,
               eq.Nombre as EquipoNombre
        FROM EstadisticaJuego ej 
        LEFT JOIN Juego j ON ej.CodJuego = j.CodJuego
        LEFT JOIN Estadistica e ON ej.CodEstadistica = e.CodEstadistica
        LEFT JOIN Jugador ju ON ej.CodJugador = ju.CodJugador
        LEFT JOIN Equipo eq ON ju.CodEquipo = eq.CodEquipo
        WHERE ej.CodJuego = @CodJuego 
          AND ej.CodEstadistica = @CodEstadistica 
          AND ej.CodJugador = @CodJugador
      `)

        if (result.recordset.length === 0) {
            return NextResponse.json(
                { error: 'Estadística de juego no encontrada' },
                { status: 404 }
            )
        }

        return NextResponse.json(result.recordset[0])
    } catch (error) {
        console.error('Error fetching estadistica juego:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { codJuego: string; codEstadistica: string; codJugador: string } }
) {
    try {
        const body: { Cantidad: number } = await request.json()
        const pool = await getConnection()

        await pool
            .request()
            .input('CodJuego', sql.NChar(6), params.codJuego)
            .input('CodEstadistica', sql.NChar(5), params.codEstadistica)
            .input('CodJugador', sql.NChar(5), params.codJugador)
            .input('Cantidad', sql.Int, body.Cantidad).query(`
        UPDATE EstadisticaJuego SET 
          Cantidad = @Cantidad 
        WHERE CodJuego = @CodJuego 
          AND CodEstadistica = @CodEstadistica 
          AND CodJugador = @CodJugador
      `)

        return NextResponse.json({ message: 'Estadística de juego actualizada exitosamente' })
    } catch (error) {
        console.error('Error updating estadistica juego:', error)
        return NextResponse.json(
            { error: 'Error al actualizar la estadística de juego' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { codJuego: string; codEstadistica: string; codJugador: string } }
) {
    try {
        const pool = await getConnection()
        await pool
            .request()
            .input('CodJuego', sql.NChar(6), params.codJuego)
            .input('CodEstadistica', sql.NChar(5), params.codEstadistica)
            .input('CodJugador', sql.NChar(5), params.codJugador).query(`
        DELETE FROM EstadisticaJuego 
        WHERE CodJuego = @CodJuego 
          AND CodEstadistica = @CodEstadistica 
          AND CodJugador = @CodJugador
      `)

        return NextResponse.json({ message: 'Estadística de juego eliminada exitosamente' })
    } catch (error) {
        console.error('Error deleting estadistica juego:', error)
        return NextResponse.json(
            { error: 'Error al eliminar la estadística de juego' },
            { status: 500 }
        )
    }
}
