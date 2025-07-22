import { type NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db'
import type { Jugador } from '@/lib/types'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const offset = (page - 1) * limit

        const pool = await getConnection()

        let query = `
      SELECT j.*, 
             e.Nombre as EquipoNombre,
             c.Nombre as CiudadNombre
      FROM Jugador j 
      LEFT JOIN Equipo e ON j.CodEquipo = e.CodEquipo
      LEFT JOIN Ciudad c ON j.CiudadNacim = c.CodCiudad
    `
        let countQuery = 'SELECT COUNT(*) as total FROM Jugador j'

        if (search) {
            const searchCondition = ` WHERE j.Nombre1 LIKE '%${search}%' OR j.Apellido1 LIKE '%${search}%' OR j.Numero LIKE '%${search}%'`
            query += searchCondition
            countQuery += searchCondition
        }

        query += ` ORDER BY j.Apellido1, j.Nombre1 OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`

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
        console.error('Error fetching jugadores:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: Jugador = await request.json()
        const pool = await getConnection()

        // Obtener todos los códigos existentes
        const existing = await pool
            .request()
            .query("SELECT CodJugador FROM Jugador WHERE CodJugador LIKE 'J%'")

        const codigos = existing.recordset
            .map((row) => parseInt(row.CodJugador.trim().slice(1), 10))
            .filter((num) => !isNaN(num))

        const siguienteNumero = Math.max(...codigos, 0) + 1
        const nuevoCodJugador = `J${String(siguienteNumero).padStart(2, '0')}` // Ej: J01, J02, etc.

        await pool
            .request()
            .input('CodJugador', sql.NChar(5), nuevoCodJugador)
            .input('Nombre1', sql.VarChar(15), body.Nombre1)
            .input('Apellido1', sql.VarChar(15), body.Apellido1)
            .input('Nombre2', sql.VarChar(15), body.Nombre2 || null)
            .input('Apellido2', sql.VarChar(15), body.Apellido2 || null)
            .input('CiudadNacim', sql.NChar(3), body.CiudadNacim)
            .input('FechaNacim', sql.Date, body.FechaNacim)
            .input('Numero', sql.NChar(4), body.Numero)
            .input('CodEquipo', sql.NChar(3), body.CodEquipo).query(`
        INSERT INTO Jugador (CodJugador, Nombre1, Apellido1, Nombre2, Apellido2, CiudadNacim, FechaNacim, Numero, CodEquipo) 
        VALUES (@CodJugador, @Nombre1, @Apellido1, @Nombre2, @Apellido2, @CiudadNacim, @FechaNacim, @Numero, @CodEquipo)
      `)

        return NextResponse.json({
            message: 'Jugador creado exitosamente',
            CodJugador: nuevoCodJugador,
        })
    } catch (error) {
        console.error('Error creating jugador:', error)
        return NextResponse.json({ error: 'Error al crear el jugador' }, { status: 500 })
    }
}
