import { type NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import type { Juego } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * limit

    const pool = await getConnection()

    let query = `
      SELECT j.*, 
             e1.Nombre as Equipo1Nombre,
             e2.Nombre as Equipo2Nombre
      FROM Juego j 
      LEFT JOIN Equipo e1 ON j.Equipo1 = e1.CodEquipo
      LEFT JOIN Equipo e2 ON j.Equipo2 = e2.CodEquipo
    `
    let countQuery = "SELECT COUNT(*) as total FROM Juego j"

    if (search) {
      const searchCondition = ` WHERE j.Descripcion LIKE '%${search}%' OR j.CodJuego LIKE '%${search}%'`
      query += searchCondition
      countQuery += searchCondition
    }

    query += ` ORDER BY j.Fecha DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`

    const [result, countResult] = await Promise.all([pool.request().query(query), pool.request().query(countQuery)])

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
    console.error("Error fetching juegos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Juego = await request.json()
    const pool = await getConnection()

    const result = await pool
      .request()
      .input("CodJuego", sql.NChar(6), body.CodJuego)
      .input("Descripcion", sql.VarChar(25), body.Descripcion)
      .input("Equipo1", sql.NChar(3), body.Equipo1)
      .input("Equipo2", sql.NChar(3), body.Equipo2)
      .input("Fecha", sql.Date, body.Fecha)
      .query(`
        INSERT INTO Juego (CodJuego, Descripcion, Equipo1, Equipo2, Fecha) 
        VALUES (@CodJuego, @Descripcion, @Equipo1, @Equipo2, @Fecha)
      `)

    return NextResponse.json({ message: "Juego creado exitosamente" })
  } catch (error) {
    console.error("Error creating juego:", error)
    return NextResponse.json({ error: "Error al crear el juego" }, { status: 500 })
  }
}
