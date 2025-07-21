import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import type { Equipo } from "@/lib/types"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input("CodEquipo", sql.NChar(3), params.id)
      .query(`
        SELECT e.*, c.Nombre as CiudadNombre 
        FROM Equipo e 
        LEFT JOIN Ciudad c ON e.CodCiudad = c.CodCiudad 
        WHERE e.CodEquipo = @CodEquipo
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error("Error fetching equipo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body: Equipo = await request.json()
    const pool = await getConnection()

    await pool
      .request()
      .input("CodEquipo", sql.NChar(3), params.id)
      .input("Nombre", sql.VarChar(25), body.Nombre)
      .input("CodCiudad", sql.NChar(3), body.CodCiudad)
      .query("UPDATE Equipo SET Nombre = @Nombre, CodCiudad = @CodCiudad WHERE CodEquipo = @CodEquipo")

    return NextResponse.json({ message: "Equipo actualizado exitosamente" })
  } catch (error) {
    console.error("Error updating equipo:", error)
    return NextResponse.json({ error: "Error al actualizar el equipo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const pool = await getConnection()
    await pool
      .request()
      .input("CodEquipo", sql.NChar(3), params.id)
      .query("DELETE FROM Equipo WHERE CodEquipo = @CodEquipo")

    return NextResponse.json({ message: "Equipo eliminado exitosamente" })
  } catch (error) {
    console.error("Error deleting equipo:", error)
    return NextResponse.json({ error: "Error al eliminar el equipo" }, { status: 500 })
  }
}
