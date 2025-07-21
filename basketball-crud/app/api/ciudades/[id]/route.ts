import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import type { Ciudad } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input("CodCiudad", sql.NChar(3), params.id)
      .query("SELECT * FROM Ciudad WHERE CodCiudad = @CodCiudad")

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Ciudad no encontrada" }, { status: 404 })
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error("Error fetching ciudad:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body: Ciudad = await request.json()
    const pool = await getConnection()

    await pool
      .request()
      .input("CodCiudad", sql.NChar(3), params.id)
      .input("Nombre", sql.VarChar(25), body.Nombre)
      .query("UPDATE Ciudad SET Nombre = @Nombre WHERE CodCiudad = @CodCiudad")

    return NextResponse.json({ message: "Ciudad actualizada exitosamente" })
  } catch (error) {
    console.error("Error updating ciudad:", error)
    return NextResponse.json({ error: "Error al actualizar la ciudad" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pool = await getConnection()
    await pool
      .request()
      .input("CodCiudad", sql.NChar(3), params.id)
      .query("DELETE FROM Ciudad WHERE CodCiudad = @CodCiudad")

    return NextResponse.json({ message: "Ciudad eliminada exitosamente" })
  } catch (error) {
    console.error("Error deleting ciudad:", error)
    return NextResponse.json({ error: "Error al eliminar la ciudad" }, { status: 500 })
  }
}
