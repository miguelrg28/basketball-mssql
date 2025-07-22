import { type NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db'
import type { Equipo } from '@/lib/types'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = Number.parseInt(searchParams.get('page') || '1')
        const limit = Number.parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const offset = (page - 1) * limit

        const pool = await getConnection()

        let query = `
      SELECT e.*, c.Nombre as CiudadNombre 
      FROM Equipo e 
      LEFT JOIN Ciudad c ON e.CodCiudad = c.CodCiudad
    `
        let countQuery = 'SELECT COUNT(*) as total FROM Equipo e'

        if (search) {
            query += ` WHERE e.Nombre LIKE '%${search}%'`
            countQuery += ` WHERE e.Nombre LIKE '%${search}%'`
        }

        query += ` ORDER BY e.Nombre OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`

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
        console.error('Error fetching equipos:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: Equipo = await request.json()
        const pool = await getConnection()

        // Obtener el último código de equipo
        const maxResult = await pool.request().query('SELECT MAX(CodEquipo) as ultimo FROM Equipo')
        const ultimo = maxResult.recordset[0]?.ultimo?.trim() ?? null

        let siguienteNumero = 1
        if (ultimo?.startsWith('E')) {
            const num = parseInt(ultimo.slice(1), 10)
            if (!isNaN(num)) {
                siguienteNumero = num + 1
            }
        }

        const nuevoCodEquipo = `E${String(siguienteNumero).padStart(2, '0')}` // Ej: E01, E02

        await pool
            .request()
            .input('CodEquipo', sql.NChar(3), nuevoCodEquipo)
            .input('Nombre', sql.VarChar(25), body.Nombre)
            .input('CodCiudad', sql.NChar(3), body.CodCiudad)
            .query(
                'INSERT INTO Equipo (CodEquipo, Nombre, CodCiudad) VALUES (@CodEquipo, @Nombre, @CodCiudad)'
            )

        return NextResponse.json({
            message: 'Equipo creado exitosamente',
            CodEquipo: nuevoCodEquipo,
        })
    } catch (error) {
        console.error('Error creating equipo:', error)
        return NextResponse.json({ error: 'Error al crear el equipo' }, { status: 500 })
    }
}
