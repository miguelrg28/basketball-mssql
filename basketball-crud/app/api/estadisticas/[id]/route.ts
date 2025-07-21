import { type NextRequest, NextResponse } from 'next/server'
import { getConnection, sql } from '@/lib/db'
import type { Estadistica } from '@/lib/types'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const pool = await getConnection()
        const result = await pool
            .request()
            .input('CodEstadistica', sql.NChar(5), params.id)
            .query('SELECT * FROM Estadistica WHERE CodEstadistica = @CodEstadistica')

        if (result.recordset.length === 0) {
            return NextResponse.json({ error: 'Estadística no encontrada' }, { status: 404 })
        }

        return NextResponse.json(result.recordset[0])
    } catch (error) {
        console.error('Error fetching estadistica:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const body: Estadistica = await request.json()
        const pool = await getConnection()

        await pool
            .request()
            .input('CodEstadistica', sql.NChar(5), params.id)
            .input('Descripcion', sql.VarChar(25), body.Descripcion)
            .input('Valor', sql.TinyInt, body.Valor)
            .query(
                'UPDATE Estadistica SET Descripcion = @Descripcion, Valor = @Valor WHERE CodEstadistica = @CodEstadistica'
            )

        return NextResponse.json({ message: 'Estadística actualizada exitosamente' })
    } catch (error) {
        console.error('Error updating estadistica:', error)
        return NextResponse.json({ error: 'Error al actualizar la estadística' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const pool = await getConnection()
        await pool
            .request()
            .input('CodEstadistica', sql.NChar(5), params.id)
            .query('DELETE FROM Estadistica WHERE CodEstadistica = @CodEstadistica')

        return NextResponse.json({ message: 'Estadística eliminada exitosamente' })
    } catch (error) {
        console.error('Error deleting estadistica:', error)
        return NextResponse.json({ error: 'Error al eliminar la estadística' }, { status: 500 })
    }
}
