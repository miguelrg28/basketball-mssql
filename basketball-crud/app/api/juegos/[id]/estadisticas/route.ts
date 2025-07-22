import { type NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const pool = await getConnection()

        // Ejecutar el stored procedure exactamente como está definido
        const result = await pool
            .request()
            .input('CodJuego', sql.NChar(6), params.id)
            .execute('sp_EstadisticasJuego')

        // El stored procedure devuelve múltiples result sets
        const [equipoLocalStats, equipoLocalTotal, equipoVisitanteStats, equipoVisitanteTotal] =
            result.recordsets

        // Obtener información básica del juego
        const juegoInfo = await pool.request().input('codjuego', sql.NChar(6), params.id).query(`
        SELECT 
          J.codjuego,
          J.Descripcion,
          J.Fecha,
          E1.Nombre as EquipoLocal,
          E2.Nombre as EquipoVisitante,
          E1.CodEquipo as CodEquipoLocal,
          E2.CodEquipo as CodEquipoVisitante
        FROM Juego J
        LEFT JOIN Equipo E1 ON J.Equipo1 = E1.CodEquipo
        LEFT JOIN Equipo E2 ON J.Equipo2 = E2.CodEquipo
        WHERE J.CodJuego = @CodJuego
      `)

        if (juegoInfo.recordset.length === 0) {
            return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 })
        }

        const juego = juegoInfo.recordset[0]

        // Determinar ganador según el stored procedure
        const puntosLocal = equipoLocalTotal[0]?.Puntos || 0
        const puntosVisitante = equipoVisitanteTotal[0]?.Puntos || 0

        let ganador = null
        if (puntosLocal > puntosVisitante) {
            ganador = 'local'
        } else if (puntosVisitante > puntosLocal) {
            ganador = 'visitante'
        }

        return NextResponse.json({
            juego: {
                ...juego,
                Fecha: new Date(juego.Fecha).toLocaleDateString('es-ES'),
            },
            equipoLocal: {
                nombre: juego.EquipoLocal,
                codigo: juego.CodEquipoLocal,
                jugadores: equipoLocalStats || [],
                totales: equipoLocalTotal[0] || {},
                esGanador: ganador === 'local',
            },
            equipoVisitante: {
                nombre: juego.EquipoVisitante,
                codigo: juego.CodEquipoVisitante,
                jugadores: equipoVisitanteStats || [],
                totales: equipoVisitanteTotal[0] || {},
                esGanador: ganador === 'visitante',
            },
            empate: ganador === null,
            // Incluir los resultados originales del stored procedure sin modificaciones
            resultadosOriginales: {
                equipoLocalStats,
                equipoLocalTotal,
                equipoVisitanteStats,
                equipoVisitanteTotal,
            },
        })
    } catch (error) {
        console.error('Error fetching estadisticas juego:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
