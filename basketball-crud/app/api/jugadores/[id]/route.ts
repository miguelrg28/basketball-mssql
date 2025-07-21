import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import type { Jugador } from "@/lib/types"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input("CodJugador", sql.NChar(5), params.id)
      .query(`
        SELECT j.*, 
               e.Nombre as EquipoNombre,
               c.Nombre as CiudadNombre
        FROM Jugador j 
        LEFT JOIN Equipo e ON j.CodEquipo = e.CodEquipo
        LEFT JOIN Ciudad c ON j.CiudadNacim = c.CodCiudad
        WHERE j.CodJugador = @CodJugador
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Jugador no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error("Error fetching jugador:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body: Jugador = await request.json()
    const pool = await getConnection()

    await pool
      .request()
      .input("CodJugador", sql.NChar(5), params.id)
      .input("Nombre1", sql.VarChar(15), body.Nombre1)
      .input("Apellido1", sql.VarChar(15), body.Apellido1)
      .input("Nombre2", sql.VarChar(15), body.Nombre2 || null)
      .input("Apellido2", sql.VarChar(15), body.Apellido2 || null)
      .input("CiudadNacim", sql.NChar(3), body.CiudadNacim)
      .input("FechaNacim", sql.Date, body.FechaNacim)
      .input("Numero", sql.NChar(4), body.Numero)
      .input("CodEquipo", sql.NChar(3), body.CodEquipo)
      .query(`
        UPDATE Jugador SET 
          Nombre1 = @Nombre1, 
          Apellido1 = @Apellido1, 
          Nombre2 = @Nombre2, 
          Apellido2 = @Apellido2, 
          CiudadNacim = @CiudadNacim, 
          FechaNacim = @FechaNacim, 
          Numero = @Numero, 
          CodEquipo = @CodEquipo 
        WHERE CodJugador = @CodJugador
      `)

    return NextResponse.json({ message: "Jugador actualizado exitosamente" })
  } catch (error) {
    console.error("Error updating jugador:", error)
    return NextResponse.json({ error: "Error al actualizar el jugador" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const pool = await getConnection()
    await pool
      .request()
      .input("CodJugador", sql.NChar(5), params.id)
      .query("DELETE FROM Jugador WHERE CodJugador = @CodJugador")

    return NextResponse.json({ message: "Jugador eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting jugador:", error)
    return NextResponse.json({ error: "Error al eliminar el jugador" }, { status: 500 })
  }
}
