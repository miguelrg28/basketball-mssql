import { type NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db'
import type { Ciudad } from '@/lib/types'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { params } = context
    try {
        const pool = await getConnection()
        const result = await pool
            .request()
            .input('CodCiudad', sql.NChar(3), params.id)
            .query('SELECT * FROM Ciudad WHERE CodCiudad = @CodCiudad')

        if (result.recordset.length === 0) {
            return NextResponse.json({ error: 'Ciudad no encontrada' }, { status: 404 })
        }

        return NextResponse.json(result.recordset[0])
    } catch (error) {
        console.error('Error fetching ciudad:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { params } = context
    try {
        const body: Ciudad = await request.json()
        const pool = await getConnection()

        await pool
            .request()
            .input('CodCiudad', sql.NChar(3), params.id)
            .input('Nombre', sql.VarChar(25), body.Nombre)
            .query('UPDATE Ciudad SET Nombre = @Nombre WHERE CodCiudad = @CodCiudad')

        return NextResponse.json({ message: 'Ciudad actualizada exitosamente' })
    } catch (error) {
        console.error('Error updating ciudad:', error)
        return NextResponse.json({ error: 'Error al actualizar la ciudad' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const pool = await getConnection()

        // Primero verificar qué registros dependen de esta ciudad
        const dependenciasResult = await pool.request().input('CodCiudad', sql.NChar(3), params.id)
            .query(`
        SELECT 
          (SELECT COUNT(*) FROM Equipo WHERE CodCiudad = @CodCiudad) as equipos,
          (SELECT COUNT(*) FROM Jugador WHERE CiudadNacim = @CodCiudad) as jugadores
      `)

        const dependencias = dependenciasResult.recordset[0]
        const totalEquipos = dependencias.equipos
        const totalJugadores = dependencias.jugadores

        if (totalEquipos > 0 || totalJugadores > 0) {
            let mensaje = 'No se puede eliminar la ciudad porque está siendo utilizada por:\n'

            if (totalEquipos > 0) {
                mensaje += `• ${totalEquipos} equipo${totalEquipos > 1 ? 's' : ''}\n`
            }

            if (totalJugadores > 0) {
                mensaje += `• ${totalJugadores} jugador${
                    totalJugadores > 1 ? 'es' : ''
                } (como ciudad de nacimiento)\n`
            }

            mensaje += '\nPrimero debe eliminar o reasignar estos registros.'

            return NextResponse.json(
                {
                    error: mensaje,
                    errorType: 'FOREIGN_KEY_CONSTRAINT',
                    dependencies: {
                        equipos: totalEquipos,
                        jugadores: totalJugadores,
                    },
                },
                { status: 409 }
            )
        }

        // Si no hay dependencias, proceder con la eliminación
        await pool
            .request()
            .input('CodCiudad', sql.NChar(3), params.id)
            .query('DELETE FROM Ciudad WHERE CodCiudad = @CodCiudad')

        return NextResponse.json({ message: 'Ciudad eliminada exitosamente' })
    } catch (error: any) {
        console.error('Error deleting ciudad:', error)

        // Capturar errores específicos de SQL Server
        if (error.number === 547) {
            // Foreign key constraint error
            return NextResponse.json(
                {
                    error: 'No se puede eliminar la ciudad porque está siendo utilizada por otros registros. Primero debe eliminar o reasignar las referencias a esta ciudad.',
                    errorType: 'FOREIGN_KEY_CONSTRAINT',
                },
                { status: 409 }
            )
        }

        return NextResponse.json({ error: 'Error al eliminar la ciudad' }, { status: 500 })
    }
}
