import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import type { Juego } from "@/lib/types"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input("CodJuego", sql.NChar(6), params.id)
      .query(`
        SELECT j.*, 
               e1.Nombre as Equipo1Nombre,
               e2.Nombre as Equipo2Nombre
        FROM Juego j 
        LEFT JOIN Equipo e1 ON j.Equipo1 = e1.CodEquipo
        LEFT JOIN Equipo e2 ON j.Equipo2 = e2.CodEquipo
        WHERE j.CodJuego = @CodJuego
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error("Error fetching juego:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body: Juego = await request.json()
    const pool = await getConnection()

    await pool
      .request()
      .input("CodJuego", sql.NChar(6), params.id)
      .input("Descripcion", sql.VarChar(25), body.Descripcion)
      .input("Equipo1", sql.NChar(3), body.Equipo1)
      .input("Equipo2", sql.NChar(3), body.Equipo2)
      .input("Fecha", sql.Date, body.Fecha)
      .query(`
        UPDATE Juego SET 
          Descripcion = @Descripcion, 
          Equipo1 = @Equipo1, 
          Equipo2 = @Equipo2, 
          Fecha = @Fecha 
        WHERE CodJuego = @CodJuego
      `)

    return NextResponse.json({ message: "Juego actualizado exitosamente" })
  } catch (error) {
    console.error("Error updating juego:", error)
    return NextResponse.json({ error: "Error al actualizar el juego" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const pool = await getConnection()
    await pool
      .request()
      .input("CodJuego", sql.NChar(6), params.id)
      .query("DELETE FROM Juego WHERE CodJuego = @CodJuego")

    return NextResponse.json({ message: "Juego eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting juego:", error)
    return NextResponse.json({ error: "Error al eliminar el juego" }, { status: 500 })
  }
}
