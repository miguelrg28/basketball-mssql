import { type NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db'
import type { EstadisticaJuego } from '@/lib/types'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const offset = (page - 1) * limit

        const pool = await getConnection()

        let query = `
      SELECT ej.*, 
             j.Descripcion as JuegoDescripcion,
             e.Descripcion as EstadisticaDescripcion,
             ju.Nombre1 + ' ' + ju.Apellido1 as JugadorNombre,
             eq.Nombre as EquipoNombre
      FROM EstadisticaJuego ej 
      LEFT JOIN Juego j ON ej.CodJuego = j.CodJuego
      LEFT JOIN Estadistica e ON ej.CodEstadistica = e.CodEstadistica
      LEFT JOIN Jugador ju ON ej.CodJugador = ju.CodJugador
      LEFT JOIN Equipo eq ON ju.CodEquipo = eq.CodEquipo
    `
        let countQuery = 'SELECT COUNT(*) as total FROM EstadisticaJuego ej'

        if (search) {
            const searchCondition = ` WHERE j.Descripcion LIKE '%${search}%' OR ju.Nombre1 LIKE '%${search}%' OR ju.Apellido1 LIKE '%${search}%'`
            query += searchCondition
            countQuery += ` LEFT JOIN Juego j ON ej.CodJuego = j.CodJuego LEFT JOIN Jugador ju ON ej.CodJugador = ju.CodJugador ${searchCondition}`
        }

        query += ` ORDER BY j.Fecha DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`

        const [result, countResult] = await Promise.all([
            pool.request().query(query),
            pool.request().query(countQuery),
        ])

        const total = countResult.recordset[0].total
        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
            data: result.recordset,
            total,
            page,
            limit,
            totalPages,
        })
    } catch (error) {
        console.error('Error fetching estadisticas juego:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: EstadisticaJuego = await request.json()
        const pool = await getConnection()

        // Primero verificar si ya existe la estadística
        const existingResult = await pool
            .request()
            .input('CodJuego', sql.NChar(6), body.CodJuego)
            .input('CodEstadistica', sql.NChar(5), body.CodEstadistica)
            .input('CodJugador', sql.NChar(5), body.CodJugador).query(`
      SELECT Cantidad FROM EstadisticaJuego 
      WHERE CodJuego = @CodJuego 
        AND CodEstadistica = @CodEstadistica 
        AND CodJugador = @CodJugador
    `)

        let message = ''

        if (existingResult.recordset.length > 0) {
            // Si existe, actualizar
            await pool
                .request()
                .input('CodJuego', sql.NChar(6), body.CodJuego)
                .input('CodEstadistica', sql.NChar(5), body.CodEstadistica)
                .input('CodJugador', sql.NChar(5), body.CodJugador)
                .input('Cantidad', sql.Int, body.Cantidad).query(`
        UPDATE EstadisticaJuego SET 
          Cantidad = @Cantidad 
        WHERE CodJuego = @CodJuego 
          AND CodEstadistica = @CodEstadistica 
          AND CodJugador = @CodJugador
      `)

            message = `Estadística actualizada exitosamente (cantidad anterior: ${existingResult.recordset[0].Cantidad})`
        } else {
            // Si no existe, crear
            await pool
                .request()
                .input('CodJuego', sql.NChar(6), body.CodJuego)
                .input('CodEstadistica', sql.NChar(5), body.CodEstadistica)
                .input('CodJugador', sql.NChar(5), body.CodJugador)
                .input('Cantidad', sql.Int, body.Cantidad).query(`
        INSERT INTO EstadisticaJuego (CodJuego, CodEstadistica, CodJugador, Cantidad) 
        VALUES (@CodJuego, @CodEstadistica, @CodJugador, @Cantidad)
      `)

            message = 'Estadística creada exitosamente'
        }

        return NextResponse.json({
            message,
            action: existingResult.recordset.length > 0 ? 'updated' : 'created',
            previousValue:
                existingResult.recordset.length > 0 ? existingResult.recordset[0].Cantidad : null,
        })
    } catch (error) {
        console.error('Error creating/updating estadistica juego:', error)
        return NextResponse.json(
            { error: 'Error al procesar la estadística de juego' },
            { status: 500 }
        )
    }
}
